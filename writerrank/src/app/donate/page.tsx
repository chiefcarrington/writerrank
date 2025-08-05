import DonationWidget from '@/components/DonationWidget';

export default function DonatePage() {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-3xl font-bold text-[color:var(--ow-orange-500)] mb-4">Support OpenWrite</h2>
      <p className="text-gray-600 mb-6">Love OpenWrite? Support our daily writing challenges with a tip!</p>
      <DonationWidget />
    </div>
  );
}
