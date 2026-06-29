import { useState } from 'react';
import { HeroLayout } from '../../../components/layout';
import { Button, Input, Card } from '../../../components/ui';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
  };

  return (
    <HeroLayout>
      <Card className="w-full max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">OrbitHR</p>
            <h1 className="text-3xl font-bold text-white">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="w-full"
            >
              Continue
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Don't have an account? <a href="#" className="text-accent hover:underline">Sign up</a>
          </p>
        </div>
      </Card>
    </HeroLayout>
  );
}
