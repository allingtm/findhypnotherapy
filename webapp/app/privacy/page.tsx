import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h1>Privacy Policy</h1>
            <p className="text-muted-foreground">This policy is effective as of 11 February 2026.</p>

            <nav className="not-prose mb-12 p-6 bg-gray-100 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contents</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#information-we-collect" className="text-purple-600 dark:text-purple-400 hover:underline">Information We Collect</a></li>
                <li><a href="#how-we-use-information" className="text-purple-600 dark:text-purple-400 hover:underline">How We Use Your Information</a></li>
                <li><a href="#third-parties" className="text-purple-600 dark:text-purple-400 hover:underline">Third-Party Services</a></li>
                <li><a href="#data-security" className="text-purple-600 dark:text-purple-400 hover:underline">Data Security</a></li>
                <li><a href="#data-retention" className="text-purple-600 dark:text-purple-400 hover:underline">Data Retention</a></li>
                <li><a href="#your-rights" className="text-purple-600 dark:text-purple-400 hover:underline">Your Rights</a></li>
                <li><a href="#gdpr" className="text-purple-600 dark:text-purple-400 hover:underline">GDPR Compliance</a></li>
                <li><a href="#contact" className="text-purple-600 dark:text-purple-400 hover:underline">Contact Us</a></li>
              </ul>
            </nav>

            <p>
              Your privacy is important to us. It is Remaster Your Mind Ltd&apos;s policy to respect your privacy and comply with any applicable law and regulation regarding any personal information we may collect about you, including across our website, Find Hypnotherapy, and other sites we own and operate.
            </p>

            <p>
              Personal information is any information about you that can be used to identify you. This includes information about you as a person (such as name, address, and date of birth), your devices, payment details, and even information about how you use a website or online service.
            </p>

            <p>
              In the event our site contains links to third-party sites and services, please be aware that those sites and services have their own privacy policies. After following a link to any third-party content, you should read their posted privacy policy information about how they collect and use personal information. This Privacy Policy does not apply to any of your activities after you leave our site.
            </p>

            <section id="information-we-collect">
              <h2>Information We Collect</h2>
              <p>
                Information we collect falls into one of two categories: &apos;voluntarily provided&apos; information and &apos;automatically collected&apos; information.
              </p>
              <p>
                &apos;Voluntarily provided&apos; information refers to any information you knowingly and actively provide us when using or participating in any of our services.
              </p>
              <p>
                &apos;Automatically collected&apos; information refers to any information automatically sent by your devices in the course of accessing our products and services.
              </p>

              <h3>Account Information</h3>
              <p>
                When you register for an account, we collect:
              </p>
              <ul>
                <li>Full name</li>
                <li>Email address</li>
                <li>Password (securely hashed - we cannot see your password)</li>
                <li>Profile photo (optional)</li>
              </ul>

              <h3>Therapist Profile Information</h3>
              <p>
                If you are a therapist creating a profile on our directory, we collect:
              </p>
              <ul>
                <li>Professional details: title, credentials, years of experience, biography</li>
                <li>Contact information: phone number, website URL</li>
                <li>Business address (with your choice of visibility: full address, city only, or hidden)</li>
                <li>Location coordinates (calculated from your address for map display)</li>
                <li>Session formats offered (online, in-person, phone)</li>
                <li>Service offerings: names, descriptions, pricing, duration</li>
                <li>Profile media: photos, banner images, videos you upload</li>
                <li>Availability schedule and booking preferences</li>
              </ul>

              <h3>Booking Information</h3>
              <p>
                When visitors book appointments with therapists, we collect:
              </p>
              <ul>
                <li>Visitor name and email address</li>
                <li>Phone number (optional)</li>
                <li>Session preferences and notes about your needs</li>
                <li>Selected date, time, and service</li>
                <li>Terms acceptance timestamp and IP address</li>
              </ul>
              <p>
                Email verification is required before bookings are confirmed. Verification tokens expire after 24 hours.
              </p>

              <h3>Client Health Information</h3>
              <p className="text-amber-600 dark:text-amber-400">
                <strong>Special Category Data:</strong> This section describes sensitive health data protected under GDPR Article 9.
              </p>
              <p>
                When therapists invite you as a client, you may be asked to provide:
              </p>
              <ul>
                <li>Personal details: name, phone number, address</li>
                <li>Emergency contact: name, phone number, relationship</li>
                <li>Health information: medical conditions, current medications, allergies</li>
                <li>GP details: name and practice (optional)</li>
              </ul>
              <p>
                <strong>Legal basis:</strong> We process this health data based on your explicit consent. Only the therapist you are working with can access this information. You can request deletion of this data at any time by contacting your therapist or us directly.
              </p>

              <h3>Messaging</h3>
              <p>
                When you use our contact form to message therapists, we collect:
              </p>
              <ul>
                <li>Your name and email address</li>
                <li>Message content and conversation history</li>
                <li>Your IP address (used for rate limiting and abuse prevention)</li>
                <li>A visitor identifier stored in your browser to maintain your conversation</li>
              </ul>
              <p>
                Email verification is required before your message is delivered to the therapist. Messages are rate-limited to 5 per email address per hour to prevent abuse.
              </p>

              <h3>Calendar Integration</h3>
              <p>
                Therapists may connect their Google Calendar, Microsoft Calendar, or Zoom account. When connected, we collect and store:
              </p>
              <ul>
                <li>OAuth access tokens (encrypted - see Data Security section)</li>
                <li>Your calendar&apos;s busy/free times (to prevent double-booking)</li>
                <li>Meeting links created for online sessions</li>
              </ul>
              <p>
                You can disconnect your calendar at any time from your dashboard settings. Disconnecting immediately deletes all stored tokens.
              </p>

              <h3>Payment and Subscription Information</h3>
              <p>
                For therapist subscriptions, we collect:
              </p>
              <ul>
                <li>Stripe customer ID (links your account to Stripe for billing)</li>
                <li>Subscription status and billing periods</li>
                <li>Trial dates (14-day free trial)</li>
              </ul>
              <p>
                <strong>Important:</strong> We do NOT store credit card numbers or payment details. All payment processing is handled securely by Stripe. Please see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe&apos;s Privacy Policy</a> for details on how they handle your payment information.
              </p>

              <h3>Technical Data</h3>
              <p>
                When you visit our website, our hosting provider (Vercel) may automatically log standard server data including your IP address, browser type, and the pages you visit. This data is used for security monitoring and troubleshooting.
              </p>
              <p>
                If you encounter errors while using the site, we may collect data about the error to help us diagnose and fix issues.
              </p>

              <h3>User-Generated Content</h3>
              <p>
                We consider &apos;user-generated content&apos; to be materials (text, image and/or video content) voluntarily supplied to us by our users for the purpose of publication on our website. This includes therapist profiles, service descriptions, and profile media.
              </p>
              <p>
                Please be aware that profile content you submit for publication will be publicly visible on our directory. Once published, it may be accessible to third parties and indexed by search engines.
              </p>
            </section>

            <section id="how-we-use-information">
              <h2>Collection and Use of Information</h2>
              <p>
                We may collect personal information from you when you do any of the following on our website:
              </p>
              <ul>
                <li>Register for an account</li>
                <li>Create or update a therapist profile</li>
                <li>Book an appointment with a therapist</li>
                <li>Send a message to a therapist</li>
                <li>Complete a client onboarding form</li>
                <li>Connect your calendar or Zoom account</li>
                <li>Subscribe to our paid service</li>
                <li>Use a mobile device or web browser to access our content</li>
                <li>Contact us via email or through our website</li>
              </ul>
              <p>
                We may collect, hold, use and disclose information for the following purposes, and personal information will not be further processed in a manner that is incompatible with these purposes:
              </p>
              <ul>
                <li>To provide you with our platform&apos;s core features and services</li>
                <li>To enable therapists to manage their profiles, services, and client bookings</li>
                <li>To enable visitors to find and book appointments with therapists</li>
                <li>To facilitate communication between therapists and potential clients</li>
                <li>To process subscription payments</li>
                <li>To send booking confirmations, reminders, and notifications</li>
                <li>To contact and communicate with you</li>
                <li>For internal record keeping and administrative purposes</li>
                <li>To comply with our legal obligations and resolve any disputes</li>
                <li>For security and fraud prevention</li>
              </ul>

              <h3>Email Communications and Tracking</h3>
              <p>
                We use SendGrid to send emails including booking confirmations, notifications, and reminders. These emails may include tracking to:
              </p>
              <ul>
                <li>Confirm successful delivery</li>
                <li>Detect bounced or failed emails</li>
                <li>Record when emails are opened (for delivery verification)</li>
              </ul>
              <p>
                This helps us ensure you receive important communications about your bookings and messages.
              </p>
            </section>

            <section id="third-parties">
              <h2>Disclosure of Personal Information to Third Parties</h2>
              <p>
                We may disclose personal information to:
              </p>
              <ul>
                <li>A parent, subsidiary or affiliate of our company</li>
                <li>Third-party service providers for the purpose of enabling them to provide their services</li>
                <li>Our employees, contractors, and/or related entities</li>
                <li>Courts, tribunals, regulatory authorities, and law enforcement officers, as required by law</li>
                <li>An entity that buys, or to which we transfer all or substantially all of our assets and business</li>
              </ul>

              <h3>Third-Party Services We Use</h3>
              <p>
                We use the following third-party services to operate our platform:
              </p>
              <ul>
                <li><strong>Supabase</strong> - Database and authentication (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Vercel</strong> - Website hosting (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Stripe</strong> - Payment processing for subscriptions (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>SendGrid (Twilio)</strong> - Email delivery and notifications (<a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Google</strong> - Calendar integration (when connected) (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Microsoft</strong> - Calendar integration (when connected) (<a href="https://privacy.microsoft.com/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Zoom</strong> - Video meeting links (when connected) (<a href="https://zoom.us/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                <li><strong>Cloudflare</strong> - File and image storage (<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              </ul>

              <h3>International Transfers of Personal Information</h3>
              <p>
                The personal information we collect is stored and/or processed in the United Kingdom and United States, or where we or our partners, affiliates, and third-party providers maintain facilities.
              </p>
              <p>
                The countries to which we store, process, or transfer your personal information may not have the same data protection laws as the country in which you initially provided the information. If we transfer your personal information to third parties in other countries: (i) we will perform those transfers in accordance with the requirements of applicable law; and (ii) we will protect the transferred personal information in accordance with this privacy policy.
              </p>
            </section>

            <section id="data-security">
              <h2>Security of Your Personal Information</h2>
              <p>
                When we collect and process personal information, and while we retain this information, we will protect it within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.
              </p>
              <p>
                We implement the following security measures:
              </p>
              <ul>
                <li><strong>Encryption:</strong> Calendar OAuth tokens are encrypted using AES-256-GCM encryption before storage</li>
                <li><strong>Password Security:</strong> Passwords are securely hashed using industry-standard algorithms (managed by Supabase)</li>
                <li><strong>Session Security:</strong> Authentication uses HTTP-only cookies that cannot be accessed by JavaScript</li>
                <li><strong>Email Verification:</strong> Required for bookings and messages, using secure random tokens (32 bytes) that expire after 24 hours</li>
                <li><strong>Rate Limiting:</strong> Messages are limited to 5 per email address per hour to prevent abuse</li>
              </ul>
              <p>
                Although we will do our best to protect the personal information you provide to us, we advise that no method of electronic transmission or storage is 100% secure and no one can guarantee absolute data security.
              </p>
              <p>
                You are responsible for selecting any password and its overall security strength, ensuring the security of your own information within the bounds of our services.
              </p>
            </section>

            <section id="data-retention">
              <h2>How Long We Keep Your Personal Information</h2>
              <p>
                We keep your personal information only for as long as we need to. Specific retention periods are:
              </p>
              <ul>
                <li><strong>Account data:</strong> Retained while your account is active</li>
                <li><strong>After account deletion:</strong> Personal data is anonymised within 90 days
                  <ul>
                    <li>Name changed to &quot;Deleted User&quot;</li>
                    <li>Email changed to an anonymised format</li>
                    <li>Profile information, photos, and videos are deleted</li>
                    <li>Calendar tokens are deleted immediately</li>
                  </ul>
                </li>
                <li><strong>Booking and financial records:</strong> Retained for 7 years (legal/accounting requirement)</li>
                <li><strong>Calendar tokens:</strong> Deleted immediately when you disconnect your calendar</li>
                <li><strong>Verification tokens:</strong> Expire and are deleted after 24 hours</li>
              </ul>
              <p>
                However, if necessary, we may retain your personal information for our compliance with a legal, accounting, or reporting obligation or for archiving purposes in the public interest.
              </p>
            </section>

            <h2>Children&apos;s Privacy</h2>
            <p>
              We do not aim any of our products or services directly at children under the age of 13 and we do not knowingly collect personal information about children under 13.
            </p>

            <section id="your-rights">
              <h2>Your Rights and Controlling Your Personal Information</h2>
              <p>
                <strong>Your choice:</strong> By providing personal information to us, you understand we will collect, hold, use, and disclose your personal information in accordance with this privacy policy. You do not have to provide personal information to us, however, if you do not, it may affect your use of our website or the products and/or services offered on or through it.
              </p>
              <p>
                <strong>Information from third parties:</strong> If we receive personal information about you from a third party, we will protect it as set out in this privacy policy. If you are a third party providing personal information about somebody else, you represent and warrant that you have such person&apos;s consent to provide the personal information to us.
              </p>
              <p>
                <strong>Access:</strong> You may request details of the personal information that we hold about you.
              </p>
              <p>
                <strong>Correction:</strong> If you believe that any information we hold about you is inaccurate, out of date, incomplete, irrelevant, or misleading, please contact us using the details provided in this privacy policy. We will take reasonable steps to correct any information found to be inaccurate, incomplete, misleading, or out of date.
              </p>
              <p>
                <strong>Deletion:</strong> You may request that we delete your personal information. If you delete your account, we will anonymise your personal data within 90 days. Some records (such as booking history) may be retained for legal compliance.
              </p>
              <p>
                <strong>Non-discrimination:</strong> We will not discriminate against you for exercising any of your rights over your personal information.
              </p>
              <p>
                <strong>Notification of data breaches:</strong> We will comply with laws applicable to us in respect of any data breach.
              </p>
              <p>
                <strong>Complaints:</strong> If you believe that we have breached a relevant data protection law and wish to make a complaint, please contact us using the details below and provide us with full details of the alleged breach. We will promptly investigate your complaint and respond to you in writing. You also have the right to contact the Information Commissioner&apos;s Office (ICO) in the UK.
              </p>
              <p>
                <strong>Unsubscribe:</strong> To unsubscribe from our email database or opt-out of communications, please contact us using the details provided in this privacy policy, or use the unsubscribe link in our emails.
              </p>
            </section>

            <h2>Use of Cookies</h2>
            <p>
              We use &apos;cookies&apos; to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site.
            </p>
            <p>
              Please refer to our <Link href="/cookie-policy">Cookie Policy</Link> for full details about the cookies we use and your choices.
            </p>

            <h2>Business Transfers</h2>
            <p>
              If we or our assets are acquired, or in the unlikely event that we go out of business or enter bankruptcy, we would include data, including your personal information, among the assets transferred to any parties who acquire us. You acknowledge that such transfers may occur and that any parties who acquire us may, to the extent permitted by applicable law, continue to use your personal information according to this policy.
            </p>

            <h2>Limits of Our Policy</h2>
            <p>
              Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and policies of those sites, and cannot accept responsibility or liability for their respective privacy practices.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              At our discretion, we may change our privacy policy to reflect updates to our business processes, current acceptable practices, or legislative or regulatory changes. If we decide to change this privacy policy, we will post the changes here at the same link by which you are accessing this privacy policy.
            </p>
            <p>
              If the changes are significant, or if required by applicable law, we will contact you (based on your selected preferences for communications from us) and all our registered users with the new details and links to the updated or changed policy.
            </p>

            <section id="gdpr">
              <h2>Additional Disclosures for General Data Protection Regulation (GDPR) Compliance (EU/UK)</h2>

              <h3>Data Controller / Data Processor</h3>
              <p>
                The GDPR distinguishes between organisations that process personal information for their own purposes (known as &quot;data controllers&quot;) and organizations that process personal information on behalf of other organizations (known as &quot;data processors&quot;). We, Remaster Your Mind Ltd, located at 82 Hazelton Road, Colchester, CO4 3DY, are a Data Controller with respect to the personal information you provide to us.
              </p>
              <p>
                When therapists use our platform to manage client information, we act as a Data Processor on their behalf, and the therapist is the Data Controller for their client data.
              </p>

              <h3>Legal Bases for Processing Your Personal Information</h3>
              <p>
                We will only collect and use your personal information when we have a legal right to do so. Our lawful bases depend on the services you use and how you use them:
              </p>

              <h4>Consent From You</h4>
              <p>
                Where you give us consent to collect and use your personal information for a specific purpose. This includes:
              </p>
              <ul>
                <li>Providing health information during client onboarding (explicit consent required for special category data)</li>
                <li>Connecting your calendar or Zoom account</li>
                <li>Receiving marketing communications</li>
              </ul>
              <p>
                You may withdraw your consent at any time using the facilities we provide; however this will not affect any use of your information that has already taken place.
              </p>

              <h4>Performance of a Contract or Transaction</h4>
              <p>
                Where you have entered into a contract or transaction with us, or in order to take preparatory steps prior to our entering into a contract. This includes:
              </p>
              <ul>
                <li>Creating an account and therapist profile</li>
                <li>Processing subscription payments</li>
                <li>Facilitating bookings between therapists and clients</li>
              </ul>

              <h4>Our Legitimate Interests</h4>
              <p>
                Where we assess it is necessary for our legitimate interests, such as for us to provide, operate, improve and communicate our services. This includes:
              </p>
              <ul>
                <li>Sending booking confirmations and reminders</li>
                <li>Preventing fraud and abuse</li>
                <li>Improving our platform</li>
              </ul>

              <h4>Compliance with Law</h4>
              <p>
                In some cases, we may have a legal obligation to use or keep your personal information. Such cases may include court orders, criminal investigations, government requests, and regulatory obligations.
              </p>

              <h3>International Transfers Outside of the European Economic Area (EEA)</h3>
              <p>
                We will ensure that any transfer of personal information from countries in the European Economic Area (EEA) or UK to countries outside will be protected by appropriate safeguards, for example by using standard data protection clauses approved by the European Commission, or the use of binding corporate rules or other legally accepted means.
              </p>

              <h3>Your GDPR Rights</h3>
              <p>
                <strong>Restrict:</strong> You have the right to request that we restrict the processing of your personal information if (i) you are concerned about the accuracy of your personal information; (ii) you believe your personal information has been unlawfully processed; (iii) you need us to maintain the personal information solely for the purpose of a legal claim; or (iv) we are in the process of considering your objection in relation to processing on the basis of legitimate interests.
              </p>
              <p>
                <strong>Objecting to processing:</strong> You have the right to object to processing of your personal information that is based on our legitimate interests or public interest.
              </p>
              <p>
                <strong>Data portability:</strong> You may have the right to request a copy of the personal information we hold about you. Where possible, we will provide this information in a commonly used, machine-readable format (such as CSV or JSON). You may also have the right to request that we transfer this personal information to a third party.
              </p>
              <p>
                <strong>Deletion:</strong> You may request that we delete the personal information we hold about you at any time. If you terminate or delete your account, we will delete or anonymise your personal information within 90 days. Please be aware that search engines may still retain copies of your public profile information even after you have deleted the information from our services.
              </p>
            </section>

            <section id="contact">
              <h2>Contact Us</h2>
              <p>
                For any questions or concerns regarding your privacy, you may contact us:
              </p>
              <ul>
                <li>Email: <a href="mailto:Gareth@remasteryourmind.co.uk">Gareth@remasteryourmind.co.uk</a></li>
                <li>Phone: <a href="tel:07812448415">07812448415</a></li>
                <li>Address: 82 Hazelton Road, Colchester, CO4 3DY</li>
              </ul>
              <p>
                For our full terms of service, please see our <Link href="/terms">Terms &amp; Conditions</Link>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
