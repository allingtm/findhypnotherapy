import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h1>Terms &amp; Conditions</h1>
            <p className="text-muted-foreground">Effective as of 11 February 2026</p>

            <nav className="not-prose mb-12 p-6 bg-gray-100 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contents</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#terms-of-service" className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</a></li>
                <li><a href="#cookie-policy" className="text-purple-600 dark:text-purple-400 hover:underline">Cookie Policy</a></li>
                <li><a href="#acceptable-use-policy" className="text-purple-600 dark:text-purple-400 hover:underline">Acceptable Use Policy</a></li>
                <li><a href="#disclaimer" className="text-purple-600 dark:text-purple-400 hover:underline">Disclaimer</a></li>
              </ul>
            </nav>

            <section id="terms-of-service">
              <h2>Terms of Service</h2>
              <p>
                These Terms of Service govern your use of the website located at <a href="https://www.findhypnotherapy.co.uk">https://www.findhypnotherapy.co.uk</a> and any related services provided by Remaster Your Mind Ltd.
              </p>
              <p>
                By accessing https://www.findhypnotherapy.co.uk, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these Terms of Service, you are prohibited from using or accessing this website or using any other services provided by Remaster Your Mind Ltd.
              </p>
              <p>
                We, Remaster Your Mind Ltd, reserve the right to review and amend any of these Terms of Service at our sole discretion. Upon doing so, we will update this page. Any changes to these Terms of Service will take effect immediately from the date of publication.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                These Terms of Service were last updated on 11 February 2026.
              </p>

              <h3>Limitations of Use</h3>
              <p>By using this website, you warrant on behalf of yourself, your users, and other parties you represent that you will not:</p>
              <ul>
                <li>modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software contained on this website;</li>
                <li>remove any copyright or other proprietary notations from any materials and software on this website;</li>
                <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server;</li>
                <li>knowingly or negligently use this website or any of its associated services in a way that abuses or disrupts our networks or any other service Remaster Your Mind Ltd provides;</li>
                <li>use this website or its associated services to transmit or publish any harassing, indecent, obscene, fraudulent, or unlawful material;</li>
                <li>use this website or its associated services in violation of any applicable laws or regulations;</li>
                <li>use this website in conjunction with sending unauthorised advertising or spam;</li>
                <li>harvest, collect or gather user data without the user&apos;s consent; or</li>
                <li>use this website or its associated services in such a way that may infringe the privacy, intellectual property rights, or other rights of third parties.</li>
              </ul>

              <h3>Intellectual Property</h3>
              <p>
                The intellectual property in the materials contained in this website are owned by or licensed to Remaster Your Mind Ltd and are protected by applicable copyright and trademark law. We grant our users permission to download one copy of the materials for personal, non-commercial transitory use.
              </p>
              <p>
                This constitutes the grant of a license, not a transfer of title. This license shall automatically terminate if you violate any of these restrictions or the Terms of Service, and may be terminated by Remaster Your Mind Ltd at any time.
              </p>

              <h3>User-Generated Content</h3>
              <p>
                You retain your intellectual property ownership rights over content you submit to us for publication on our website. We will never claim ownership of your content but we do require a license from you in order to use it.
              </p>
              <p>
                When you use our website or its associated services to post, upload, share or otherwise transmit content covered by intellectual property rights, you grant to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to use, distribute, modify, run, copy, publicly display, translate or otherwise create derivative works of your content in a manner that is consistent with your privacy preferences and our Privacy Policy.
              </p>
              <p>
                The license you grant us can be terminated at any time by deleting your content or account. However, to the extent that we (or our partners) have used your content in connection with commercial or sponsored content, the license will continue until the relevant commercial or post has been discontinued by us.
              </p>
              <p>
                You give us permission to use your username and other identifying information associated with your account in a manner that is consistent with your privacy preferences and our Privacy Policy.
              </p>

              <h3>Liability</h3>
              <p>
                Our website and the materials on our website are provided on an &apos;as is&apos; basis. To the extent permitted by law, Remaster Your Mind Ltd makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property, or other violation of rights.
              </p>
              <p>
                In no event shall Remaster Your Mind Ltd or its suppliers be liable for any consequential loss suffered or incurred by you or any third party arising from the use or inability to use this website or the materials on this website, even if Remaster Your Mind Ltd or an authorised representative has been notified, orally or in writing, of the possibility of such damage.
              </p>
              <p>
                In the context of this agreement, &quot;consequential loss&quot; includes any consequential loss, indirect loss, real or anticipated loss of profit, loss of benefit, loss of revenue, loss of business, loss of goodwill, loss of opportunity, loss of savings, loss of reputation, loss of use and/or loss or corruption of data, whether under statute, contract, equity, tort (including negligence), indemnity or otherwise.
              </p>
              <p>
                Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>

              <h3>Accuracy of Materials</h3>
              <p>
                The materials appearing on our website are not comprehensive and are for general information purposes only. Remaster Your Mind Ltd does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on this website, or otherwise relating to such materials or on any resources linked to this website.
              </p>

              <h3>Links</h3>
              <p>
                Remaster Your Mind Ltd has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement, approval or control by Remaster Your Mind Ltd of the site. Use of any such linked site is at your own risk and we strongly advise you make your own investigations with respect to the suitability of those sites.
              </p>

              <h3>Right to Terminate</h3>
              <p>
                We may suspend or terminate your right to use our website and terminate these Terms of Service immediately upon written notice to you for any breach of these Terms of Service.
              </p>

              <h3>Severance</h3>
              <p>
                Any term of these Terms of Service which is wholly or partially void or unenforceable is severed to the extent that it is void or unenforceable. The validity of the remainder of these Terms of Service is not affected.
              </p>

              <h3>Governing Law</h3>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of England and Wales. You irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section id="cookie-policy">
              <h2>Cookie Policy</h2>
              <p>
                We use cookies to help improve your experience of our website. For full details about the cookies we use, how we use them, and your choices regarding cookies, please see our dedicated <Link href="/cookie-policy">Cookie Policy</Link>.
              </p>
            </section>

            <section id="acceptable-use-policy">
              <h2>Acceptable Use Policy</h2>
              <p>
                This policy outlines expected conduct when using Find Hypnotherapy. Violations may result in account suspension or termination. In serious cases, we may be legally obliged to report violations to the relevant authorities.
              </p>

              <h3>Therapist Profiles</h3>
              <p>If you are a therapist using our directory, you agree that:</p>
              <ul>
                <li>All profile information must be accurate and truthful</li>
                <li>Credentials and qualifications must be genuine and verifiable</li>
                <li>You may only create one profile per therapist</li>
                <li>You are responsible for keeping your profile information up to date</li>
              </ul>

              <h3>Prohibited Conduct</h3>
              <p>You must not:</p>
              <ul>
                <li>Create fake, misleading, or impersonated profiles</li>
                <li>Send spam or unsolicited promotional messages through our messaging system</li>
                <li>Scrape, harvest, or collect data about therapists or visitors without authorisation</li>
                <li>Attempt to circumvent our security measures or access accounts that are not yours</li>
                <li>Use the platform for any unlawful purpose</li>
                <li>Post content that is defamatory, harassing, discriminatory, or threatening</li>
                <li>Infringe the intellectual property rights of others</li>
                <li>Impersonate Remaster Your Mind Ltd or misrepresent your relationship with us</li>
              </ul>

              <h3>Enforcement</h3>
              <p>
                We reserve the right to remove content, suspend accounts, or take other appropriate action for violations of this policy. We may modify this policy at any time by publishing the revised version on our website.
              </p>
            </section>

            <section id="disclaimer">
              <h2>Disclaimer</h2>
              <p>
                Any information provided by Remaster Your Mind Ltd on this website is for reference only. While we try to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or any related services offered as part of this community. Any reliance you place on such information is therefore strictly at your own risk.
              </p>
            </section>

            <section className="mt-16 pt-8 border-t border-gray-200 dark:border-neutral-700">
              <h2>Contact Us</h2>
              <p>If you have any questions about these terms, please contact us:</p>
              <ul>
                <li>Email: <a href="mailto:Gareth@remasteryourmind.co.uk">Gareth@remasteryourmind.co.uk</a></li>
                <li>Phone: <a href="tel:07812448415">07812448415</a></li>
              </ul>
              <p>
                For more information about how we handle your personal data, please see our <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
