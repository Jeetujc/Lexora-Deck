import React from 'react';
import { Navbar, Footer, Hero, Card, Button, Modal, Input} from '../components';
import { Zap, Shield, Rocket, Users, Mail, Phone } from 'lucide-react';

function Home() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with performance in mind, delivering blazing fast load times and smooth interactions.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee and robust data protection.',
    },
    {
      icon: Rocket,
      title: 'Easy to Scale',
      description: 'Grow your business with our scalable infrastructure that adapts to your needs.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with powerful collaboration tools and real-time updates.',
    },
    
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* <Navbar /> */}
      
      <main>
        <Hero />
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn in a New Way
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  variant={index === 1 ? 'featured' : 'default'}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              See Our Components in Action
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Button Variants</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Input Examples</h3>
                <div className="space-y-3">
                  <Input 
                    placeholder="Enter your email" 
                    icon={Mail} 
                    label="Email Address"
                  />
                  <Input 
                    placeholder="Enter your phone" 
                    icon={Phone} 
                    variant="filled"
                    label="Phone Number"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setIsModalOpen(true)}
            >
              Open Modal Demo
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal Demo"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            This is a demo modal showcasing the modal component. It includes proper focus management, 
            keyboard navigation, and smooth animations.
          </p>
          
          <Input 
            label="Your Name"
            placeholder="Enter your name"
            fullWidth
          />
          
          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={() => setIsModalOpen(false)}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Home;