import { HeroLayout } from '../../../components/layout';
import { Button } from '../../../components/ui';

export default function LandingPage() {
  return (
    <HeroLayout>
      <div className="text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">OrbitHR</p>
        <h1 className="text-5xl md:text-6xl font-bold text-white">
          Modern HR Management
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Streamline employee management, attendance tracking, leave requests, and skill development all in one intuitive platform.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </HeroLayout>
  );
}
