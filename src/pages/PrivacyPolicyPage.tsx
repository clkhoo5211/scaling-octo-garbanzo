import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        <strong>Last Updated:</strong> November 8, 2025
      </p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Introduction
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Web3News (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you use our decentralized news aggregation platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Information We Collect
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Information You Provide
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Wallet addresses (when you connect your wallet)</li>
                <li>Email addresses (if you use email authentication)</li>
                <li>Social media account information (if you use social login)</li>
                <li>User preferences and settings</li>
                <li>Content you submit (articles, comments, votes)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Automatically Collected Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>IP address and geolocation data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage data (pages visited, time spent, interactions)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>To provide and maintain our services</li>
            <li>To personalize your experience</li>
            <li>To process transactions and manage subscriptions</li>
            <li>To send you notifications and updates</li>
            <li>To analyze usage patterns and improve our platform</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Information Sharing and Disclosure
          </h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information only in the
            following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>
              <strong>Service Providers:</strong> With third-party service providers who assist us
              in operating our platform (e.g., authentication providers, analytics services)
            </li>
            <li>
              <strong>Legal Requirements:</strong> When required by law or to protect our rights
            </li>
            <li>
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
              sale of assets
            </li>
            <li>
              <strong>With Your Consent:</strong> When you explicitly authorize us to share your
              information
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Blockchain and Decentralization
          </h2>
          <p className="text-gray-700 mb-4">
            Web3News operates on blockchain technology, which means:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>
              Transactions (votes, bids, subscriptions) are recorded on public blockchains
            </li>
            <li>
              Wallet addresses and transaction data are publicly visible on the blockchain
            </li>
            <li>
              We cannot modify or delete blockchain transactions once they are recorded
            </li>
            <li>
              Your wallet address may be linked to your on-chain activity
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Data Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet or electronic storage
            is 100% secure. While we strive to use commercially acceptable means to protect your data,
            we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Rights
          </h2>
          <p className="text-gray-700 mb-4">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>
              <strong>Access:</strong> Request access to your personal information
            </li>
            <li>
              <strong>Correction:</strong> Request correction of inaccurate data
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal information
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data
            </li>
            <li>
              <strong>Objection:</strong> Object to processing of your data
            </li>
            <li>
              <strong>Withdraw Consent:</strong> Withdraw consent for data processing
            </li>
          </ul>
          <p className="text-gray-700 mt-4">
            <strong>Note:</strong> Some rights may be limited for blockchain data, as blockchain
            transactions are immutable and cannot be deleted.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Cookies and Tracking Technologies
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar tracking technologies to collect and store information. For
            more information about our cookie practices, please see our{" "}
            <Link
              to="/cookie-policy"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Third-Party Services
          </h2>
          <p className="text-gray-700 mb-4">
            We use the following third-party services that may collect information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>
              <strong>Reown AppKit:</strong> Wallet connection and authentication
            </li>
            <li>
              <strong>Clerk:</strong> User management and authentication
            </li>
            <li>
              <strong>Supabase:</strong> Database and backend services
            </li>
            <li>
              <strong>Analytics Providers:</strong> Usage analytics (if you consent to analytics cookies)
            </li>
          </ul>
          <p className="text-gray-700 mt-4">
            These services have their own privacy policies. We encourage you to review them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Children&apos;s Privacy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our services are not intended for children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you believe we have collected
            information from a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by updating the &quot;Last Updated&quot; date at the top of this policy. We encourage you to
            review this Privacy Policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Email: [Your Contact Email]</li>
            <li>Website: [Your Website]</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>By using our website, you acknowledge that you have read and understood this
          Privacy Policy.</strong>
        </p>
      </div>
    </div>
  );
}

