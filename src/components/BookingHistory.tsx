import { format } from "date-fns";
// Import badge for status display
import { Badge } from "./ui/badge";

interface Booking {
  _id: string;
  serviceId: { name: string; price: number };
  date: string;
  slot: string;
  price: number;
  status: string;
}

export function BookingHistory({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
        No booking history found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div 
          key={booking._id} 
          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm"
        >
          <div>
            <h4 className="font-semibold text-gray-900">{booking.serviceId?.name || "Unknown Service"}</h4>
            <div className="text-sm text-gray-500 mt-1">
              {format(new Date(booking.date), 'PPP')} at {booking.slot}
            </div>
          </div>
          <div className="text-right">
             <div className="font-bold text-gray-900">₹{booking.price}</div>
             <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'} className="mt-1">
               {booking.status}
             </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
