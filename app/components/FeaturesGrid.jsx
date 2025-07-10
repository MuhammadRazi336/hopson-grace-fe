import {
    Monitor,
    CreditCard,
    Plane,
    BarChart3,
    List,
    Users,
    Percent,
    Truck,
    Heart,
    Lightbulb,
    Home,
  } from "lucide-react"
  
  export default function FeaturesGrid() {
    const features = [
      {
        icon: Monitor,
        title: "THE WORLD'S BEST BRANDS",
        description: "Over 150 heritage and artisanal brands with gifts for every budget and milestone.",
      },
      {
        icon: CreditCard,
        title: "CASH, GIFT CARDS & PERSONALIZED FUNDS",
        description: "Your day, your way — add honeymoon funds, home improvement, or anything in between.",
      },
      {
        icon: Plane,
        title: "BESPOKE TRAVEL",
        description: "Exclusive honeymoon funds and custom itineraries, curated by our travel partners.",
      },
      {
        icon: BarChart3,
        title: "PRIVATE DASHBOARD & GIFT TRACKER",
        description: "Track who gave what, view guest messages, and manage thank you notes all in one place.",
      },
      {
        icon: List,
        title: "READY-MADE REGISTRIES",
        description: "Pre-built, ready-to-shop registries curated by us and real couples to make getting started easy.",
      },
      {
        icon: Users,
        title: "GROUP GIFTING",
        description:
          "Guests can contribute together to larger gifts — like that Le Creuset Dutch Oven you've been eyeing.",
      },
      {
        icon: Percent,
        title: "NEWLYWED DISCOUNT",
        description: "Take 15% off anything left on your list after the wedding.",
      },
      {
        icon: Truck,
        title: "FREE SHIPPING, TWICE.",
        description:
          "We cover shipping on two separate deliveries, so you can receive your gifts when the timing is right — at no cost, no stress.",
      },
      {
        icon: Heart,
        title: "FEWER, BETTER THINGS",
        description: "A curated assortment of design-forward, quality products that are made to last a lifetime.",
      },
      {
        icon: Lightbulb,
        title: "STYLE ADVICE & GUIDED TOOLS",
        description: "Curated edits, style tips, and planning tools — plus smart suggestions tailored to you.",
      },
      {
        icon: Home,
        title: "PERSONALIZED HOMEPAGE",
        description: "Your registry, your way — beautifully presented and easy for your guests to explore.",
      },
    ]
  
    return (
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[120rem] mx-auto">
          <div className="flex justify-center gap-y-10 flex-wrap">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="text-center space-y-4 w-3/12">
                  {/* Icon Circle */}
                  <div className="mx-auto w-[180px] h-[180px] bg-slate-600 rounded-full flex items-center justify-center">
                    <IconComponent className="w-16 h-16 text-white" />
                  </div>
  
                  {/* Title */}
                  <h3 className="text-2xl h-20 font-semibold tracking-wider uppercase text-gray-900 py-4">{feature.title}</h3>
  
                  {/* Description */}
                  <p className="text-2xl text-gray-600 leading-relaxed max-w-xs mx-auto">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  