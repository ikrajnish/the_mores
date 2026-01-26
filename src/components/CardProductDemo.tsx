
import { Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardProductDemoProps {
    className?: string
}

export function CardProductDemo({ className }: CardProductDemoProps) {
  return (
    <Card className={cn("w-[300px]", className)}>
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-slate-100">
             {/* Placeholder for image */}
             <div className="flex h-full items-center justify-center text-slate-400">
                 Image
             </div>
             <Badge className="absolute left-2 top-2">New</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 p-4">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Product Name</CardTitle>
            <span className="text-lg font-bold">₹999</span>
        </div>
        <CardDescription>
            A short description of the product.
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="w-full">Add to Cart</Button>
        <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
