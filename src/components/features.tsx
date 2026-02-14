import { Zap, Link2, Shield } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'See results as votes come in. Live charts update instantly with zero delay.',
    },
    {
      icon: Link2,
      title: 'Easy Sharing',
      description: 'One link, unlimited participants. Share via email, chat, or social media.',
    },
    {
      icon: Shield,
      title: 'Fair Voting',
      description: 'Smart abuse prevention ensures authentic results you can trust.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
