-- TASK22 PROPOSAL ONLY; D-HIST-01/04 review required. NOT a production migration.
-- schema.prisma is deliberately unchanged. Do not auto-backfill order from time/UUID.
-- Stage nullable columns for legacy rows; new reviewed writers explicitly initialize
-- next_message_sequence=1 only after authenticated legacy inventory/cutover.
ALTER TABLE conversations ADD COLUMN next_message_sequence bigint;
ALTER TABLE conversations ADD CONSTRAINT history_counter_positive
  CHECK (next_message_sequence IS NULL OR next_message_sequence > 0);
ALTER TABLE messages ADD COLUMN conversation_sequence bigint;
ALTER TABLE messages ADD COLUMN reply_to_user_message_id uuid;
ALTER TABLE messages ADD CONSTRAINT history_sequence_positive
  CHECK (conversation_sequence IS NULL OR conversation_sequence > 0);
CREATE UNIQUE INDEX messages_conversation_sequence_unique
  ON messages(conversation_id, conversation_sequence) WHERE conversation_sequence IS NOT NULL;
-- Composite FK prevents cross-Conversation reply links; target USER role and
-- prior sequence are additionally validated by the authorized application writer.
ALTER TABLE messages ADD CONSTRAINT messages_id_conversation_unique UNIQUE(id, conversation_id);
ALTER TABLE messages ADD CONSTRAINT history_reply_same_conversation
  FOREIGN KEY(reply_to_user_message_id, conversation_id)
  REFERENCES messages(id, conversation_id) ON DELETE NO ACTION
  DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE messages ADD CONSTRAINT history_role_reply
  CHECK (conversation_sequence IS NULL OR
    (role = 'USER'::"MessageRole" AND reply_to_user_message_id IS NULL) OR
    (role = 'ASSISTANT'::"MessageRole" AND reply_to_user_message_id IS NOT NULL));
-- Under Conversation FOR UPDATE: allocate adjacent USER/ASSISTANT slots,
-- increment counter, insert acceptance receipt atomically; completion and deletion
-- take the same lock. No long I/O inside transaction. Check bigint exhaustion.
-- Keep null legacy rows opaque; a separate reviewed baseline may fence them off.
-- Required future Prisma/client migration must match these exact constraints;
-- deferred composite FK is supplemental SQL. Do not drop columns on rollback.
