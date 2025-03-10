/**
 * @schema AdminRefund
 * type: object
 * description: The refund's details.
 * x-schemaName: AdminRefund
 * required:
 *   - id
 *   - amount
 *   - created_at
 *   - payment
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The refund's ID.
 *   amount:
 *     type: number
 *     title: amount
 *     description: The refund's amount.
 *   refund_reason_id:
 *     type: string
 *     title: refund_reason_id
 *     description: The ID of the refund reason.
 *   note:
 *     type: string
 *     title: note
 *     description: More details about the refund.
 *   created_at:
 *     type: string
 *     format: date-time
 *     title: created_at
 *     description: The date the refund was created.
 *   created_by:
 *     type: string
 *     title: created_by
 *     description: The ID of the user that created the refund.
 *   payment:
 *     $ref: "#/components/schemas/BasePayment"
 *   refund_reason:
 *     $ref: "#/components/schemas/RefundReason"
 * 
*/

