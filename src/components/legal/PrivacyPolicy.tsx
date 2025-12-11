import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Privacy Policy Page Component
 * 
 * Public page explaining data collection and usage
 * Required for Google OAuth verification
 */
export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Privacy Policy</CardTitle>
            <CardDescription>
              Last Updated: {new Date().toLocaleDateString("id-ID", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-slate max-w-none">
            <div>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Subscription Reminder ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our subscription management application.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect the following types of information:
              </p>
              
              <h3 className="text-xl font-semibold mb-2">2.1. Information from Google OAuth</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li><strong>Email Address:</strong> Your primary Google account email address</li>
                <li><strong>Name:</strong> Your display name from your Google account</li>
                <li><strong>Profile Picture:</strong> Your Google account profile picture (if available)</li>
                <li><strong>Google User ID:</strong> A unique identifier provided by Google</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.2. Information You Provide</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                <li><strong>Subscription Data:</strong> Names, descriptions, prices, payment dates, and types of subscriptions</li>
                <li><strong>Payment Information:</strong> Payment dates, amounts, and payment status</li>
                <li><strong>Reminder Preferences:</strong> Your reminder settings and preferences</li>
                <li><strong>Currency Settings:</strong> Your preferred currency for displaying prices</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">2.3. Google Calendar Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>We create, read, update, and delete calendar events in your Google Calendar</li>
                <li>These events are used to remind you about upcoming subscription payments</li>
                <li>We only access calendars that you explicitly authorize</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Authentication:</strong> To verify your identity and provide secure access to your account</li>
                <li><strong>Subscription Management:</strong> To store and manage your subscription information</li>
                <li><strong>Payment Tracking:</strong> To track payment installments and payment status</li>
                <li><strong>Calendar Integration:</strong> To create, update, and delete reminder events in your Google Calendar</li>
                <li><strong>Notifications:</strong> To send you reminders about upcoming payments</li>
                <li><strong>User Experience:</strong> To personalize your experience and display information in your preferred currency</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
              <p className="text-muted-foreground mb-3">
                We take data security seriously:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All data is stored securely in a PostgreSQL database</li>
                <li>We use encrypted connections (HTTPS) for all data transmission</li>
                <li>Session tokens are securely signed and stored</li>
                <li>We follow industry-standard security practices to protect your data</li>
                <li>Access to your data is restricted to authenticated sessions only</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. Google Calendar Access</h2>
              <p className="text-muted-foreground mb-3">
                When you authorize our application to access your Google Calendar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>We create calendar events for subscription payment reminders</li>
                <li>We update events when you modify subscription information</li>
                <li>We delete events when you mark payments as paid or delete subscriptions</li>
                <li>We only access calendars that you explicitly authorize</li>
                <li>You can revoke access at any time through your Google Account settings</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-3">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Google Services:</strong> We use Google OAuth and Google Calendar API as per their terms of service</li>
                <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal requests</li>
                <li><strong>Service Providers:</strong> With trusted service providers who assist in operating our application (e.g., hosting providers)</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> You can access all your data through the application</li>
                <li><strong>Modification:</strong> You can update or modify your subscription and profile information at any time</li>
                <li><strong>Deletion:</strong> You can delete your subscriptions, installments, and account data</li>
                <li><strong>Revoke Access:</strong> You can revoke Google Calendar access through your Google Account settings</li>
                <li><strong>Account Deletion:</strong> You can request account deletion by contacting us</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Session Management</h2>
              <p className="text-muted-foreground mb-3">
                We use session cookies to maintain your authentication state:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Session cookies are used to authenticate your requests</li>
                <li>Cookies are securely signed and stored in your browser</li>
                <li>Session data is stored in our database for security purposes</li>
                <li>You can clear cookies through your browser settings, which will log you out</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your data for as long as your account is active or as needed to provide our services. 
                If you delete your account, we will delete your personal information, except where we are 
                required to retain it for legal purposes.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for children under the age of 13. We do not knowingly collect 
                personal information from children under 13. If you believe we have collected information 
                from a child under 13, please contact us immediately.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last Updated" date. 
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong> ikhsanpahdian@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

