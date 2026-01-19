
import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center isolate p-4">
       <div 
        className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
       ></div>
       
       <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out rounded-3xl overflow-hidden border border-white/10 max-h-[90vh]">
           <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300"
            >
                <X size={24}/>
            </button>

          <div className="px-8 pt-10 pb-4 bg-white dark:bg-gray-900 z-20 shrink-0 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2 text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs">
                <Shield size={14} />
                <span>Legal</span>
              </div>
              <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">
                 Privacy Policy
              </h2>
              <p className="text-xs text-gray-500 mt-2">Last Updated: December 30, 2025</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6 font-sans">
              
              <p>
                Candor Digital Group, LLC ("we," "our," or "us"), based in Chicago, Illinois, respects your privacy and is committed to protecting it through our compliance with this policy.
              </p>
              <p>
                This Privacy Policy describes the types of information we may collect from you or that you may provide when you download, install, register with, access, or use the Voyageurs mobile application (the "App") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">1. Information We Collect About You</h3>
                <p className="mb-2">We collect information from and about users of our App:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Directly from you when you provide it to us.</li>
                    <li>Automatically when you use the App.</li>
                </ul>

                <h4 className="font-bold text-med-blue dark:text-white mt-4 mb-2">A. Information You Provide to Us</h4>
                <p className="mb-2">When you download, register with, or use this App, we may ask you provide information:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Personal Identifiers:</strong> By which you may be personally identified, such as name, email address, mailing address, and telephone number.</li>
                    <li><strong>Account Details:</strong> Username, password, and other registration details.</li>
                    <li><strong>User Contributions:</strong> Content you post, publish, or display on the App (e.g., photos, comments, reviews).</li>
                    <li><strong>Transaction Data:</strong> If you purchase services or subscriptions through the App, we (or our third-party payment processors) collect financial information required to process your payment.</li>
                </ul>

                <h4 className="font-bold text-med-blue dark:text-white mt-4 mb-2">B. Information Collected Automatically</h4>
                <p className="mb-2">When you download, access, and use the App, it may use technology to automatically collect:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>Usage Details:</strong> Traffic data, logs, communication data, and the resources that you access and use on the App.</li>
                    <li><strong>Device Information:</strong> Information about your mobile device and internet connection, including the device's unique device identifier (IP address, IMEI, MAC address), operating system, browser type, and mobile network information.</li>
                    <li><strong>Location Information:</strong> The App collects real-time information about the location of your device to provide location-based services.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">2. How We Use Your Information</h3>
                <p className="mb-2">We use information that we collect about you or that you provide to us, including any personal information:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>To provide you with the App and its contents.</li>
                    <li>To fulfill the purposes for which you provided it (e.g., processing transactions).</li>
                    <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
                    <li>To notify you about changes to our App or any products or services we offer.</li>
                    <li>To allow you to participate in interactive features on our App.</li>
                    <li>To comply with applicable laws, including Illinois state regulations.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">3. Disclosure of Your Information</h3>
                <p className="mb-4">We do not sell, trade, or rent your personal identification information to others. We may disclose aggregated information about our users (which does not identify any individual) without restriction.</p>
                <p className="mb-2">We may disclose personal information that we collect or you provide:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>To Service Providers:</strong> Contractors, service providers, and other third parties we use to support our business.</li>
                    <li><strong>For Legal Reasons:</strong> To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Candor Digital Group, LLC's assets.</li>
                </ul>
                <p className="mb-2"><strong>Third-Party Services:</strong> The App uses third-party services that may collect information used to identify you. The privacy policies of the third-party service providers used by the App can be found at the following links:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-med-blue dark:text-blue-400 underline">Google Play Services</a></li>
                    <li><a href="https://firebase.google.com/policies/analytics" target="_blank" rel="noreferrer" className="text-med-blue dark:text-blue-400 underline">Google Analytics for Firebase</a></li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">4. Illinois Privacy Rights</h3>
                <p className="mb-4"><strong>Illinois Personal Information Protection Act (PIPA):</strong> We comply with Illinois PIPA (815 ILCS 530/). In the unlikely event of a data breach involving your personal information, we will notify you and the proper authorities in the most expedient time possible and without unreasonable delay, consistent with the legitimate needs of law enforcement.</p>
                <p className="mb-4"><strong>Biometric Information (BIPA Warning):</strong> "Voyageurs" does not collect, store, or transmit biometric identifiers or biometric information (such as fingerprints, face scans, or voiceprints) from its users.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">5. Your Rights & Account Deletion (App Store & Play Store Compliance)</h3>
                <p className="mb-4">In accordance with Apple App Store Guidelines (5.1.1) and the Google Play User Data Policy, you have the right to request the deletion of your account and associated data.</p>
                <h4 className="font-bold text-med-blue dark:text-white mb-2">How to Delete Your Data:</h4>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li><strong>In-App:</strong> You can initiate the deletion of your account directly within the Voyageurs app by navigating to Settings {'>'} Account {'>'} Delete Account.</li>
                    <li><strong>Web Request:</strong> If you cannot access the app or have uninstalled it, you may request account deletion by visiting our website at <a href="https://voyageurs.app" className="text-med-blue dark:text-blue-400 underline">https://voyageurs.app</a> or emailing us directly at <a href="mailto:support@voyageurs.app" className="text-med-blue dark:text-blue-400 underline">support@voyageurs.app</a>.</li>
                </ul>
                <p className="mb-4"><strong>Data Retention:</strong> Upon receiving a deletion request, we will permanently delete your account and associated personal data from our active databases within 30 days. Please note that we may retain specific data where required by law (such as transaction records for tax and accounting purposes) or for legitimate business security purposes (such as fraud prevention).</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">6. Data Security</h3>
                <p className="mb-4">We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">7. Children Under the Age of 13</h3>
                <p className="mb-4">Our App is not intended for children under 13 years of age. No one under age 13 may provide any information to or on the App. We do not knowingly collect personal information from children under 13. If you believe we might have any information from or about a child under 13, please contact us at the email listed below.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">8. Changes to Our Privacy Policy</h3>
                <p className="mb-4">It is our policy to post any changes we make to our privacy policy on this page with a notice that the privacy policy has been updated on the App home screen. The date the privacy policy was last revised is identified at the top of the page.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">9. Contact Information</h3>
                <p className="mb-2">To ask questions or comment about this privacy policy and our privacy practices, contact us at:</p>
                <address className="not-italic mb-4">
                    <strong>Candor Digital Group, LLC</strong><br/>
                    205 N Michigan Ave. Ste 810-B<br/>
                    Chicago, IL 60601-5902<br/>
                    <a href="mailto:support@voyageurs.app" className="text-med-blue dark:text-blue-400 underline">support@voyageurs.app</a><br/>
                    <a href="https://voyageurs.app" target="_blank" rel="noreferrer" className="text-med-blue dark:text-blue-400 underline">https://voyageurs.app</a>
                </address>
              </section>

          </div>
       </div>
    </div>
  );
};
