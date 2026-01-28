
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MembershipCardProps {
    id: string;
    name: string;
    price: number;
    period?: string;
    description: string;
    benefits: string[];
    isPopular?: boolean;
    variant?: 'default' | 'gold' | 'platinum';
    onAction?: (id: string) => void;
    actionLabel?: string;
    className?: string;
}

export function MembershipCard({
    id,
    name,
    price,
    period = "/ year",
    description,
    benefits,
    isPopular,
    variant = 'default',
    onAction,
    actionLabel = "Claim Membership",
    className
}: MembershipCardProps) {
    const isGold = variant === 'gold' || name.toUpperCase() === 'GOLD';
    const isPlatinum = variant === 'platinum' || name.toUpperCase() === 'PLATINUM';

    const borderColor = isGold ? "border-amber-500/50 shadow-amber-500/20 ring-1 ring-amber-500/20 bg-slate-800" : "border-slate-700 bg-slate-800";
    const buttonClass = isPlatinum ? "bg-slate-900 text-white hover:bg-slate-950 border border-slate-700" :
                        isGold ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700" :
                        "bg-slate-800 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white";

    return (
        <div className={cn(
            "relative flex flex-col p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-500/10",
            borderColor,
            className
        )}>
            {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
                    MOST POPULAR
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-50 uppercase tracking-wide">{name}</h3>
                <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-slate-50">₹{price.toLocaleString()}</span>
                    {period && <span className="ml-1 text-slate-400 text-sm">{period}</span>}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-green-400">
                    Validity: 1 Year (365 Days)
                </div>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>

            <div className="flex-grow">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Membership Privileges</p>
                <ul className="space-y-3 mb-8">
                    {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                            <Check className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                            <span className="text-slate-400 text-sm leading-snug">{benefit}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <Button 
                className={cn("w-full transition-transform active:scale-95 border-0", buttonClass)}
                onClick={() => onAction && onAction(id)}
            >
                {actionLabel}
            </Button>
        </div>
    );
}
