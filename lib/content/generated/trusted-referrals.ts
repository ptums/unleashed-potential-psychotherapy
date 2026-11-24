/* Generated from schemas/trusted-referrals.json by scripts/gen-types.mjs. Do not edit. */

/**
 * People outside the practice that Jess trusts and refers clients to. They show under "Trusted Referrals" in the Clinicians menu of the site header. This is not a page of its own.
 */
export interface TrustedReferrals {
  referrals: TrustedReferrals1;
}
export interface TrustedReferrals1 {
  /**
   * Listed in this order in the Clinicians menu. Each link opens the person's own site in a new tab.
   *
   * @minItems 0
   * @maxItems 20
   */
  items:
    | []
    | [Referral]
    | [Referral, Referral]
    | [Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral]
    | [Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral, Referral]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ]
    | [
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral,
        Referral
      ];
}
export interface Referral {
  /**
   * The person's name, for example Kristin Brien.
   */
  name: string;
  /**
   * The full web address, starting with https://.
   */
  link: string;
}
