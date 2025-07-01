import React from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Select, Textarea, Spinner } from '../components/ui'

export const ComponentDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-gray p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-light text-deep-charcoal mb-8">Component Library</h1>
        
        {/* Buttons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="large">Large</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </CardContent>
        </Card>
        
        {/* Form Elements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="you@example.com"
              hint="We'll never share your email"
            />
            <Input 
              label="Password" 
              type="password" 
              error="Password must be at least 8 characters"
            />
            <Select
              label="Country"
              placeholder="Select a country"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'kr', label: 'South Korea' },
                { value: 'cn', label: 'China' },
              ]}
            />
            <Textarea
              label="Message"
              placeholder="Type your message here..."
              rows={4}
              hint="Maximum 500 characters"
            />
          </CardContent>
        </Card>
        
        {/* Badges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and labels</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge size="small">Small Badge</Badge>
          </CardContent>
        </Card>
        
        {/* Loading States */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Spinner components</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Spinner size="small" />
            <Spinner size="medium" />
            <Spinner size="large" />
          </CardContent>
        </Card>
        
        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card style</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">This is a default card with standard styling.</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">This card has more elevation.</p>
            </CardContent>
          </Card>
          
          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover for effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">This card responds to hover.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}