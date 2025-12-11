import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Terms of Service Page Component
 * 
 * Public page explaining terms and conditions of service
 * Recommended for Google OAuth verification
 */
export function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Terms of Service</CardTitle>
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
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Subscription Reminder ("the Service"), you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-3">
                Subscription Reminder is a web application that helps you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Manage and track your subscription services</li>
                <li>Monitor payment installments and due dates</li>
                <li>Receive reminders through Google Calendar integration</li>
                <li>View statistics and reports about your subscriptions</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Authentication</h2>
              <p className="text-muted-foreground mb-3">
                To use our Service, you must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Authenticate using your Google account (Google OAuth)</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">4. Google Services Integration</h2>
              <p className="text-muted-foreground mb-3">
                Our Service integrates with Google services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Google OAuth:</strong> For authentication and user identification</li>
                <li><strong>Google Calendar API:</strong> For creating and managing payment reminder events</li>
                <li>By using our Service, you agree to Google's Terms of Service and Privacy Policy</li>
                <li>You can revoke access to Google services at any time through your Google Account settings</li>
                <li>We only access data that you explicitly authorize</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
              <p className="text-muted-foreground mb-3">
                You agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Use the Service only for lawful purposes</li>
                <li>Provide accurate and truthful information</li>
                <li>Not use the Service to violate any laws or regulations</li>
                <li>Not attempt to gain unauthorized access to the Service</li>
                <li>Not interfere with or disrupt the Service or servers</li>
                <li>Not use automated systems to access the Service without permission</li>
                <li>Respect the intellectual property rights of others</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">6. Data and Content</h2>
              <p className="text-muted-foreground mb-3">
                Regarding your data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You retain ownership of all data you input into the Service</li>
                <li>You are responsible for the accuracy of your data</li>
                <li>We store your data securely as described in our Privacy Policy</li>
                <li>You can export, modify, or delete your data at any time</li>
                <li>We may delete inactive accounts after a reasonable period</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground mb-3">
                We strive to provide reliable service, but:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We may perform maintenance that temporarily affects availability</li>
                <li>We reserve the right to modify or discontinue the Service at any time</li>
                <li>We are not responsible for any loss of data due to service interruptions</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Subscription Reminder and its developers shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages, or any loss 
                of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, 
                or other intangible losses resulting from your use of the Service.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-3">
                The Service and its original content, features, and functionality are owned by Subscription Reminder 
                and are protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws.
              </p>
              <p className="text-muted-foreground">
                You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p className="text-muted-foreground mb-3">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Breach of these Terms of Service</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Request by law enforcement or government agencies</li>
                <li>Extended periods of inactivity</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                You may terminate your account at any time by deleting your account or contacting us. 
                Upon termination, your right to use the Service will immediately cease.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any 
                material changes by posting the new Terms of Service on this page and updating the "Last Updated" date. 
                Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms of Service shall be governed by and construed in accordance with applicable laws, 
                without regard to its conflict of law provisions.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
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

