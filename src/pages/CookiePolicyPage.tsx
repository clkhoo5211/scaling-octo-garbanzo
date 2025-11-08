export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        Cookie Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <strong>Last Updated:</strong> November 7, 2025
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What Are Cookies?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files that are placed on your device when you visit our website.
            They help us provide you with a better experience by remembering your preferences and
            understanding how you use our site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Types of Cookies We Use
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Necessary Cookies (Required)
              </h3>
              <p className="text-gray-700 mb-2">
                These cookies are essential for the website to function properly. They enable core
                functionality such as security, network management, and accessibility. You cannot
                opt-out of these cookies.
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Authentication cookies</li>
                <li>Security cookies</li>
                <li>Load balancing cookies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Analytics Cookies
              </h3>
              <p className="text-gray-700 mb-2">
                These cookies help us understand how visitors interact with our website by
                collecting and reporting information anonymously.
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Page views</li>
                <li>Time spent on pages</li>
                <li>Click patterns</li>
                <li>Error tracking</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Purpose:</strong> To improve website performance and user experience.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Functional Cookies
              </h3>
              <p className="text-gray-700 mb-2">
                These cookies enable enhanced functionality and personalization, such as remembering
                your preferences and settings.
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Language preferences</li>
                <li>Theme preferences (light/dark mode)</li>
                <li>User interface customizations</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Purpose:</strong> To provide a personalized experience.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                4. Marketing Cookies
              </h3>
              <p className="text-gray-700 mb-2">
                These cookies are used to track visitors across websites to display relevant
                advertisements.
              </p>
              <p className="text-gray-600 text-sm mb-2">
                <strong>Examples:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Ad targeting cookies</li>
                <li>Social media integration cookies</li>
                <li>Retargeting cookies</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Purpose:</strong> To show you relevant advertisements and measure ad
                effectiveness.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Managing Your Cookie Preferences
          </h2>
          <p className="text-gray-700 mb-4">
            You can manage your cookie preferences at any time by:
          </p>
          <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
            <li>Clicking the &quot;Cookie Settings&quot; button in the cookie consent banner</li>
            <li>Adjusting your preferences in the Cookie Settings modal</li>
            <li>Changing your browser settings to block or delete cookies</li>
          </ol>
          <p className="text-gray-700 mt-4">
            <strong>Note:</strong> Blocking certain cookies may affect website functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Third-Party Cookies
          </h2>
          <p className="text-gray-700 mb-2">
            We may use third-party services that set their own cookies:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>
              <strong>Analytics Providers:</strong> Google Analytics, etc.
            </li>
            <li>
              <strong>Authentication Providers:</strong> Clerk, Reown AppKit
            </li>
            <li>
              <strong>Content Providers:</strong> RSS feed aggregators
            </li>
          </ul>
          <p className="text-gray-700 mt-4">
            These third parties have their own privacy policies and cookie practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Duration</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>
              <strong>Session Cookies:</strong> Deleted when you close your browser
            </li>
            <li>
              <strong>Persistent Cookies:</strong> Remain on your device for a set period (up to 1
              year)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-2">
            Under GDPR and other privacy laws, you have the right to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Accept or reject non-essential cookies</li>
            <li>Withdraw your consent at any time</li>
            <li>Access information about cookies we use</li>
            <li>Request deletion of your cookie data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about our cookie policy, please contact us at:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
            <li>Email: [Your Contact Email]</li>
            <li>Website: [Your Website]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Updates to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time. We will notify you of any changes
            by updating the &quot;Last Updated&quot; date at the top of this policy.
          </p>
        </section>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>By using our website, you consent to our use of cookies in accordance with this
          policy.</strong>
        </p>
      </div>
    </div>
  );
}

