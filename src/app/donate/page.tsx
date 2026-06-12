import { Metadata } from "next";
import DonationForm from "@/components/DonationForm";

export const metadata: Metadata = {
  title: "Donate | Kingdom Redeemed Life Ecclesia",
  description:
    "Give securely through Paystack or use bank transfer/mobile money to support church ministry and thanksgiving programs.",
};

export default function DonatePage() {
  return (
    <section className="relative z-10 py-24 md:py-28 lg:py-32">
      <div className="container">
        <div className="mb-14 max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Give with gratitude
          </span>
          <h1 className="mb-6 text-4xl font-bold text-dark dark:text-white md:text-5xl">
            Make a Donation
          </h1>
          <p className="mx-auto max-w-2xl text-base text-body-color dark:text-body-color-dark sm:text-lg">
            Choose to give securely online via Paystack or use traditional bank transfer and mobile money options below.
          </p>
        </div>

        <div className="mb-12">
          <DonationForm />
        </div>

        <div className="mb-8 rounded-[20px] border border-yellow-300/70 bg-yellow-50 p-6 text-sm text-dark dark:border-yellow-500/40 dark:bg-yellow-900/10 dark:text-yellow-100">
          <p className="font-semibold mb-2">Paystack mobile money may require active mobile money channels in your account.</p>
          <p>If the phone prompt does not appear or you see a Paystack channel error, please use the bank transfer or direct mobile money instructions provided below.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[20px] border border-body-color/10 bg-white p-8 shadow-three dark:border-white/10 dark:bg-[#11131A] dark:shadow-none">
            <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white">Bank Transfer</h2>
            <p className="mb-8 text-body-color dark:text-body-color-dark">
              Transfer your gift directly to the church account below. Please include your name and giving purpose in the payment reference.
            </p>
            <dl className="space-y-4 text-base text-dark dark:text-white">
              <div>
                <dt className="font-semibold">Bank Name</dt>
                <dd>Kingdom Redeemed Bank</dd>
              </div>
              <div>
                <dt className="font-semibold">Account Name</dt>
                <dd>Kingdom Redeemed Life Ecclesia</dd>
              </div>
              <div>
                <dt className="font-semibold">Account Number</dt>
                <dd>123-456-7890</dd>
              </div>
              <div>
                <dt className="font-semibold">Branch</dt>
                <dd>Main City Branch</dd>
              </div>
              <div>
                <dt className="font-semibold">Reference</dt>
                <dd>Use your name and gift type</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[20px] border border-body-color/10 bg-white p-8 shadow-three dark:border-white/10 dark:bg-[#11131A] dark:shadow-none">
            <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white">Mobile Money</h2>
            <p className="mb-8 text-body-color dark:text-body-color-dark">
              Use mobile money for a convenient gift. Choose your preferred provider and follow the Paystack prompt on your phone to complete payment.
            </p>
            <dl className="space-y-4 text-base text-dark dark:text-white">
              <div>
                <dt className="font-semibold">MTN Mobile Money</dt>
                <dd>+256 700 123 456</dd>
              </div>
              <div>
                <dt className="font-semibold">AirtelTigo</dt>
                <dd>+256 705 987 654</dd>
              </div>
              <div>
                <dt className="font-semibold">Telecel</dt>
                <dd>+256 703 321 000</dd>
              </div>
              <div>
                <dt className="font-semibold">Operator Name</dt>
                <dd>Kingdom Redeemed Life Ecclesia</dd>
              </div>
              <div>
                <dt className="font-semibold">Instructions</dt>
                <dd>Choose mobile money on the form, enter your number, then confirm the prompt sent to your phone.</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[20px] border border-primary/10 bg-primary/5 p-8 shadow-three dark:border-primary/20 dark:bg-[#0D1A2A] dark:shadow-none">
            <h2 className="mb-4 text-2xl font-bold text-dark dark:text-white">Covenant Seed</h2>
            <p className="mb-6 text-body-color dark:text-body-color-dark">
              Subscribe for monthly card deduction with a fixed Covenant Seed amount. Choose GHS 100, 500, or 1000 and complete the form to authorize secure recurring card payment.
            </p>
            <ul className="space-y-4 text-base text-dark dark:text-white">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                <span>Monthly deduction authorized from your card.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                <span>Secure Paystack card processing.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
                <span>Dedicated Covenant Seed support for members.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-[20px] border border-body-color/10 bg-[#F8F9FF] p-8 text-center dark:bg-[#0D1120] dark:border-white/10">
          <h3 className="mb-4 text-xl font-semibold text-dark dark:text-white">
            Need help completing your gift?
          </h3>
          <p className="mx-auto max-w-2xl text-base text-body-color dark:text-body-color-dark">
            After your payment, please send the transfer confirmation to our church office so we can follow up and give you a receipt.
          </p>
        </div>
      </div>
    </section>
  );
}
