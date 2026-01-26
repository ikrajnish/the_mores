import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings | Mores Salon",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
