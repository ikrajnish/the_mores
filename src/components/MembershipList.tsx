"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { MembershipCard } from "./MembershipCard";

interface IMem {
    _id: string;
    name: string;
    price: number;
    description: string;
    benefits: string[];
}

export function MembershipList({ memberships }: { memberships: IMem[] }) {
    const { user } = useUser();
    const router = useRouter();

    const handleWhatsAppClaim = (tier: IMem) => {
        if (!user) {
            router.push('/login');
            return;
        }

        const message = encodeURIComponent(
            `Hi, I am interested in upgrading my membership.\n\n` +
            `*User*: ${user.name} (${user.email})\n` +
            `*Membership*: ${tier.name}\n` +
            `*Price*: ₹${tier.price}\n\n` +
            `Please process my request.`
        );
        const whatsappUrl = `https://wa.me/918102603450?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <main className="flex-grow container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-purple-400 font-semibold tracking-wider text-sm">MEMBERSHIPS</span>
                <h1 className="text-4xl font-bold text-slate-50 mt-2 mb-4">Unlock Exclusive Perks</h1>
                <p className="text-slate-400">
                    Join the Mores Elite club and enjoy premium benefits, priority bookings, and significant discounts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {memberships.map((tier) => (
                    <MembershipCard
                        key={tier._id}
                        id={tier._id}
                        name={tier.name}
                        price={tier.price}
                        description={tier.description}
                        benefits={tier.benefits}
                        isPopular={tier.name === 'GOLD'}
                        variant={tier.name.toLowerCase() as any}
                        onAction={() => handleWhatsAppClaim(tier)}
                        actionLabel="Request Upgrade on WhatsApp"
                    />
                ))}
            </div>
        </main>
    );
}
