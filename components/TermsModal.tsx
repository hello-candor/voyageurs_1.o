
import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
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
                <FileText size={14} />
                <span>Legal</span>
              </div>
              <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">
                 Terms of Service
              </h2>
              <p className="text-xs text-gray-500 mt-2">Last Updated: December 30, 2025</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6 font-sans">
              
              <p>
                Welcome to Voyageurs. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User" or "you") and Candor Digital Group, LLC ("Company," "we," "us," or "our"), based in Chicago, Illinois.
              </p>
              <p>
                By accessing or using the Voyageurs mobile application (the "App") and our website at <a href="https://voyageurs.app" className="text-med-blue dark:text-blue-400 underline">https://voyageurs.app</a>, you agree to be bound by these Terms. If you do not agree, do not use the App.
              </p>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">1. Eligibility</h3>
                <p className="mb-2">By using the App, you represent and warrant that you are at least 13 years of age. If you are under 18, you represent that you have the consent of a parent or guardian to use this App.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">2. User Accounts</h3>
                <p className="mb-2">To access certain features, you may be required to register for an account.</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                    <li>You agree to provide accurate, current, and complete information.</li>
                    <li>We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">3. Use of Services & Restrictions</h3>
                <p className="mb-2">You are granted a limited, non-exclusive, non-transferable, and revocable license to use the App for personal, non-commercial use. You agree not to:</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Use the App for any illegal purpose or in violation of any local, state, or federal law.</li>
                    <li>Copy, modify, distribute, sell, or lease any part of our App or included software.</li>
                    <li>Reverse engineer or attempt to extract the source code of the App.</li>
                    <li>Use the App in a manner that could interfere with, disrupt, or negatively affect other users.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">4. User-Generated Content</h3>
                <p className="mb-2">If the App allows you to post reviews, photos, or comments ("Content"):</p>
                <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>You retain ownership of your Content, but you grant Candor Digital Group, LLC a worldwide, royalty-free, perpetual license to use, host, store, reproduce, and display such Content.</li>
                    <li>You are solely responsible for the Content you post. We reserve the right to remove any Content that we deem offensive, inappropriate, or in violation of intellectual property rights.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">5. Intellectual Property</h3>
                <p className="mb-4">All rights, title, and interest in and to the App (excluding Content provided by users), including its "look and feel," logos, graphics, and code, are the exclusive property of Candor Digital Group, LLC.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">6. Location-Based Services</h3>
                <p className="mb-4">The App may provide location-based data. This data is for basic informational purposes only and is not intended to be relied upon in situations where precise location information is needed or where erroneous, inaccurate, or incomplete location data may lead to death, personal injury, property, or environmental damage. We do not guarantee the availability, accuracy, or timeliness of location data.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">7. Limitation of Liability</h3>
                <p className="mb-4 uppercase font-bold text-xs leading-relaxed">TO THE MAXIMUM EXTENT PERMITTED BY LAW, CANDOR DIGITAL GROUP, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</p>
                <p className="mb-4">In no event shall our aggregate liability exceed the greater of one hundred U.S. Dollars ($100.00) or the amount you paid us, if any, in the past six months for the services giving rise to the claim.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">8. Disclaimer of Warranties</h3>
                <p className="mb-4 uppercase font-bold text-xs leading-relaxed">YOUR USE OF THE APP IS AT YOUR SOLE RISK. THE APP IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">9. Governing Law & Jurisdiction</h3>
                <p className="mb-4">These Terms are governed by the laws of the State of Illinois, without regard to its conflict of laws principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Cook County, Chicago, Illinois, and the parties hereby irrevocably consent to the personal jurisdiction and venue therein.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">10. Termination</h3>
                <p className="mb-4">We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the App will immediately cease.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">11. Changes to Terms</h3>
                <p className="mb-4">We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the App after such changes constitutes your acceptance of the new Terms.</p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">12. Contact Information</h3>
                <p className="mb-2">If you have any questions about these Terms, please contact us at:</p>
                <address className="not-italic mb-4">
                    <strong>Candor Digital Group, LLC</strong><br/>
                    205 N Michigan Ave. Ste 810-B<br/>
                    Chicago, IL 60601-5902<br/>
                    <a href="mailto:support@voyageurs.app" className="text-med-blue dark:text-blue-400 underline">support@voyageurs.app</a>
                </address>
              </section>

          </div>
       </div>
    </div>
  );
};
