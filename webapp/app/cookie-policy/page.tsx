import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import Link from "next/link"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <h1>Cookie Policy</h1>
            <p className="text-gray-500 dark:text-gray-400">Last updated: 11 February 2026</p>

            <p>
              This Cookie Policy explains how we use cookies and similar technologies on our website. By using our site, you agree to the use of cookies as described in this policy.
            </p>

            <nav className="not-prose mb-8 p-6 bg-gray-100 dark:bg-neutral-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contents</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#what-are-cookies" className="text-purple-600 dark:text-purple-400 hover:underline">What Are Cookies?</a></li>
                <li><a href="#cookies-we-use" className="text-purple-600 dark:text-purple-400 hover:underline">Cookies We Use</a></li>
                <li><a href="#local-storage" className="text-purple-600 dark:text-purple-400 hover:underline">Local Storage</a></li>
                <li><a href="#third-party" className="text-purple-600 dark:text-purple-400 hover:underline">Third-Party Services</a></li>
                <li><a href="#your-choices" className="text-purple-600 dark:text-purple-400 hover:underline">Your Cookie Choices</a></li>
                <li><a href="#contact" className="text-purple-600 dark:text-purple-400 hover:underline">Contact Us</a></li>
              </ul>
            </nav>

            <section id="what-are-cookies">
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your computer or mobile device when you visit our website. They allow us to recognize your device and remember certain information about your visit. Cookies are widely used to make websites work more efficiently and provide a better user experience.
              </p>
            </section>

            <section id="cookies-we-use">
              <h2>Cookies We Use</h2>
              <p>We use cookies for several purposes to improve your experience on our website:</p>

              <h3>Essential Cookies</h3>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Required - Cannot be disabled</p>
              <p>
                These cookies are necessary for the website to function properly. They enable basic features like user authentication and security features. Without these cookies, the website cannot function correctly.
              </p>

              <h4>Authentication Cookies (Supabase)</h4>
              <p>
                We use Supabase for user authentication. When you log in, the following cookies are set:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Cookie Name</th>
                      <th className="text-left font-semibold">Purpose</th>
                      <th className="text-left font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>sb-*-auth-token</code></td>
                      <td>Stores your session access token to keep you logged in</td>
                      <td>Session</td>
                    </tr>
                    <tr>
                      <td><code>sb-*-auth-refresh-token</code></td>
                      <td>Allows automatic session refresh without re-login</td>
                      <td>Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                These cookies are marked as <strong>httpOnly</strong> (cannot be accessed by JavaScript) and <strong>secure</strong> (only sent over HTTPS) for your protection.
              </p>

              <h4>Calendar Integration Cookies (Temporary)</h4>
              <p>
                If you connect your Google Calendar, Microsoft Calendar, or Zoom account, temporary cookies are set during the connection process:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Cookie Name</th>
                      <th className="text-left font-semibold">Purpose</th>
                      <th className="text-left font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>google_oauth_state</code></td>
                      <td>Security token for Google Calendar connection</td>
                      <td>10 minutes</td>
                    </tr>
                    <tr>
                      <td><code>microsoft_oauth_state</code></td>
                      <td>Security token for Microsoft Calendar connection</td>
                      <td>10 minutes</td>
                    </tr>
                    <tr>
                      <td><code>zoom_oauth_state</code></td>
                      <td>Security token for Zoom connection</td>
                      <td>10 minutes</td>
                    </tr>
                    <tr>
                      <td><code>oauth_user_id</code></td>
                      <td>Temporarily identifies your account during connection</td>
                      <td>10 minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                These cookies are automatically deleted after the calendar connection is complete or after 10 minutes, whichever comes first. They are only set when you actively connect a calendar service.
              </p>

            </section>

            <section id="local-storage">
              <h2>Local Storage</h2>
              <p>
                In addition to cookies, we use your browser&apos;s local storage to save certain preferences. Local storage is similar to cookies but allows for larger amounts of data and persists until explicitly cleared.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Key</th>
                      <th className="text-left font-semibold">Purpose</th>
                      <th className="text-left font-semibold">Data Stored</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>cookie-consent</code></td>
                      <td>Stores your cookie preferences</td>
                      <td>Your consent choices and timestamp</td>
                    </tr>
                    <tr>
                      <td><code>theme</code></td>
                      <td>Stores your dark/light mode preference</td>
                      <td>&quot;light&quot;, &quot;dark&quot;, or &quot;system&quot;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Local storage data persists until you clear your browser data or we update our storage requirements.
              </p>
            </section>

            <section id="third-party">
              <h2>Third-Party Services</h2>
              <p>
                Our website uses services from trusted third parties. Here&apos;s how they interact with your browser:
              </p>

              <h3>Stripe (Payment Processing)</h3>
              <p>
                We use Stripe to process subscription payments for therapists. When you visit our pricing or checkout pages, Stripe may set cookies for fraud prevention and to remember your payment preferences.
              </p>
              <ul>
                <li><strong>Purpose:</strong> Payment processing and fraud prevention</li>
                <li><strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
              </ul>

              <h3>Supabase (Authentication)</h3>
              <p>
                Our authentication system is powered by Supabase. Session cookies are managed securely as described in the Essential Cookies section above.
              </p>
              <ul>
                <li><strong>Purpose:</strong> User authentication and session management</li>
                <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></li>
              </ul>

              <h3>Google, Microsoft, and Zoom (Calendar Integration)</h3>
              <p>
                If you choose to connect your calendar, these services may set their own cookies during the authentication process. This only occurs when you actively connect a calendar service from your dashboard settings.
              </p>
              <ul>
                <li><strong>Google:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                <li><strong>Microsoft:</strong> <a href="https://privacy.microsoft.com/" target="_blank" rel="noopener noreferrer">Microsoft Privacy Policy</a></li>
                <li><strong>Zoom:</strong> <a href="https://zoom.us/privacy" target="_blank" rel="noopener noreferrer">Zoom Privacy Policy</a></li>
              </ul>

              <h3>What We Don&apos;t Use</h3>
              <p className="text-gray-500 dark:text-gray-400 italic">
                We do not use Google Analytics, Facebook Pixel, or other advertising or behavioral tracking services. We believe in respecting your privacy and only collect what&apos;s necessary to provide our services.
              </p>
            </section>

            <section id="your-choices">
              <h2>Your Cookie Choices</h2>
              <p>You have control over how we use cookies on our website:</p>

              <h3>Cookie Notice</h3>
              <p>
                When you first visit our site, you&apos;ll see a cookie notice informing you about the essential cookies we use. Since we only use necessary cookies for authentication and security, there are no optional cookies to reject. You can view our cookie information at any time by clicking the &quot;Cookie Settings&quot; link in our website footer.
              </p>

              <h3>Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul>
                <li>View what cookies are stored on your device</li>
                <li>Delete some or all cookies</li>
                <li>Block cookies from specific or all websites</li>
                <li>Set preferences for first-party vs. third-party cookies</li>
              </ul>
              <p>
                Note that blocking essential cookies may prevent you from logging in or using certain features of our website.
              </p>

              <h3>Clearing Local Storage</h3>
              <p>
                To clear local storage data, you can use your browser&apos;s developer tools or clear all site data through your browser settings. This will reset your theme preference and cookie consent choices.
              </p>

              <h2>Cookie Retention</h2>
              <p>Different types of cookies are stored for different periods:</p>
              <ul>
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>OAuth State Cookies:</strong> Automatically deleted after 10 minutes</li>
                <li><strong>Authentication Cookies:</strong> Persist while your session is active</li>
                <li><strong>Consent Preferences:</strong> Stored in local storage until you clear browser data</li>
              </ul>
            </section>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we make significant changes, we will notify you by updating the &quot;Last updated&quot; date at the top of this policy.
            </p>

            <section id="contact">
              <h2>Contact Us</h2>
              <p>If you have any questions about this Cookie Policy, please contact us:</p>
              <ul>
                <li>Email: <a href="mailto:Gareth@remasteryourmind.co.uk">Gareth@remasteryourmind.co.uk</a></li>
                <li>Phone: <a href="tel:07812448415">07812448415</a></li>
                <li>Address: 82 Hazelton Road, Colchester, CO4 3DY</li>
              </ul>
              <p>
                For more information about how we handle your personal data, please see our <Link href="/privacy">Privacy Policy</Link>. For our full terms of service, please see our <Link href="/terms">Terms &amp; Conditions</Link>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}
