"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import {
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Download,
  Figma,
  Code,
  Zap,
  Users,
  BarChart3,
} from "lucide-react"
import type { DEXProject } from "../dex-development-dashboard"

interface UIDesignStepProps {
  project: DEXProject
  onComplete: () => void
  onUpdate: (updates: Partial<DEXProject>) => void
}

const DESIGN_THEMES = [
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Clean, minimal design with focus on usability",
    colors: ["#000000", "#FFFFFF", "#3B82F6", "#10B981"],
    preview: "/api/placeholder/300/200",
  },
  {
    id: "dark",
    name: "Dark Professional",
    description: "Dark theme optimized for trading",
    colors: ["#0F172A", "#1E293B", "#3B82F6", "#06B6D4"],
    preview: "/api/placeholder/300/200",
  },
  {
    id: "colorful",
    name: "Vibrant & Engaging",
    description: "Colorful design to attract users",
    colors: ["#7C3AED", "#EC4899", "#F59E0B", "#10B981"],
    preview: "/api/placeholder/300/200",
  },
  {
    id: "classic",
    name: "Classic Finance",
    description: "Traditional financial interface",
    colors: ["#1F2937", "#374151", "#059669", "#DC2626"],
    preview: "/api/placeholder/300/200",
  },
]

const UI_COMPONENTS = [
  {
    id: "swap",
    name: "Swap Interface",
    description: "Token swapping component",
    complexity: "Medium",
    estimatedHours: 12,
    features: ["Token selection", "Amount input", "Price impact", "Slippage settings"],
    required: true,
  },
  {
    id: "liquidity",
    name: "Liquidity Pool",
    description: "Add/remove liquidity interface",
    complexity: "Medium",
    estimatedHours: 10,
    features: ["Pool selection", "Ratio display", "LP token management"],
    required: true,
  },
  {
    id: "pools",
    name: "Pools Explorer",
    description: "Browse available pools",
    complexity: "Low",
    estimatedHours: 8,
    features: ["Pool list", "Search/filter", "APY display", "TVL metrics"],
    required: true,
  },
  {
    id: "portfolio",
    name: "Portfolio Dashboard",
    description: "User portfolio overview",
    complexity: "Medium",
    estimatedHours: 15,
    features: ["Balance overview", "Transaction history", "P&L tracking"],
    required: false,
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    description: "Trading analytics and charts",
    complexity: "High",
    estimatedHours: 20,
    features: ["Price charts", "Volume metrics", "TVL tracking", "Historical data"],
    required: false,
  },
  {
    id: "governance",
    name: "Governance Portal",
    description: "Voting and proposals interface",
    complexity: "High",
    estimatedHours: 18,
    features: ["Proposal list", "Voting interface", "Delegation", "Results display"],
    required: false,
  },
]

const RESPONSIVE_BREAKPOINTS = [
  { name: "Mobile", width: 375, icon: Smartphone },
  { name: "Tablet", width: 768, icon: Tablet },
  { name: "Desktop", width: 1024, icon: Monitor },
]

export function UIDesignStep({ project, onComplete, onUpdate }: UIDesignStepProps) {
  const [selectedTheme, setSelectedTheme] = useState("modern")
  const [selectedComponents, setSelectedComponents] = useState<string[]>(
    UI_COMPONENTS.filter((c) => c.required).map((c) => c.id),
  )
  const [customBranding, setCustomBranding] = useState({
    projectName: project.name,
    logo: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    fontFamily: "Inter",
  })
  const [designPriorities, setDesignPriorities] = useState({
    usability: [8],
    aesthetics: [7],
    performance: [9],
    accessibility: [6],
  })
  const [userPersonas, setUserPersonas] = useState("")
  const [designRequirements, setDesignRequirements] = useState("")

  const toggleComponent = (componentId: string) => {
    const component = UI_COMPONENTS.find((c) => c.id === componentId)
    if (component?.required) return

    setSelectedComponents((prev) =>
      prev.includes(componentId) ? prev.filter((id) => id !== componentId) : [...prev, componentId],
    )
  }

  const calculateEstimates = () => {
    const totalHours = UI_COMPONENTS.filter((c) => selectedComponents.includes(c.id)).reduce(
      (total, c) => total + c.estimatedHours,
      0,
    )
    return {
      totalHours,
      estimatedWeeks: Math.ceil(totalHours / 40),
      components: selectedComponents.length,
    }
  }

  const estimates = calculateEstimates()
  const isComplete = selectedComponents.length >= 3 && customBranding.projectName && selectedTheme

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Alert>
        <Palette className="h-4 w-4" />
        <AlertTitle>UI/UX Design</AlertTitle>
        <AlertDescription>
          Design your DEX user interface with modern, responsive components that provide excellent user experience.
        </AlertDescription>
      </Alert>

      {/* Design Estimates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Design Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{estimates.totalHours}h</div>
              <div className="text-sm text-muted-foreground">Design Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{estimates.components}</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{estimates.estimatedWeeks}w</div>
              <div className="text-sm text-muted-foreground">Timeline</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Theme Selection
              </CardTitle>
              <CardDescription>Choose a design theme that matches your brand and target audience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DESIGN_THEMES.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all ${
                      selectedTheme === theme.id
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Eye className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{theme.name}</h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        <div className="flex gap-1">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {selectedTheme === theme.id && (
                          <Badge variant="secondary" className="w-full justify-center">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                UI Components
              </CardTitle>
              <CardDescription>Select the components your DEX interface will include</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UI_COMPONENTS.map((component) => (
                  <Card
                    key={component.id}
                    className={`cursor-pointer transition-all ${
                      selectedComponents.includes(component.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "hover:shadow-md"
                    } ${component.required ? "border-green-200" : ""}`}
                    onClick={() => toggleComponent(component.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(component.id)}
                          disabled={component.required}
                          className="mt-1"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{component.name}</h3>
                            {component.required && <Badge variant="secondary">Required</Badge>}
                            <Badge variant="outline">{component.complexity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                          <div className="text-xs text-muted-foreground mb-2">~{component.estimatedHours} hours</div>
                          <div className="space-y-1">
                            {component.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>Customize your DEX branding and visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={customBranding.projectName}
                    onChange={(e) => setCustomBranding({ ...customBranding, projectName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    placeholder="https://..."
                    value={customBranding.logo}
                    onChange={(e) => setCustomBranding({ ...customBranding, logo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customBranding.primaryColor}
                      onChange={(e) => setCustomBranding({ ...customBranding, primaryColor: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={customBranding.primaryColor}
                      onChange={(e) => setCustomBranding({ ...customBranding, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={customBranding.secondaryColor}
                      onChange={(e) => setCustomBranding({ ...customBranding, secondaryColor: e.target.value })}
                      className="w-16"
                    />
                    <Input
                      value={customBranding.secondaryColor}
                      onChange={(e) => setCustomBranding({ ...customBranding, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Design Priorities</Label>
                <div className="space-y-4 mt-2">
                  {Object.entries(designPriorities).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{key}</span>
                        <span>{value[0]}/10</span>
                      </div>
                      <Slider
                        value={value}
                        onValueChange={(newValue) => setDesignPriorities({ ...designPriorities, [key]: newValue })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Responsive Design
              </CardTitle>
              <CardDescription>Ensure your DEX works perfectly across all devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {RESPONSIVE_BREAKPOINTS.map((breakpoint) => (
                    <Card key={breakpoint.name}>
                      <CardContent className="p-4 text-center">
                        <breakpoint.icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h3 className="font-medium">{breakpoint.name}</h3>
                        <p className="text-sm text-muted-foreground">{breakpoint.width}px+</p>
                        <div className="mt-3 space-y-2">
                          <div className="h-2 bg-green-200 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full w-4/5"></div>
                          </div>
                          <p className="text-xs text-muted-foreground">Optimized</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertTitle>Mobile-First Approach</AlertTitle>
                  <AlertDescription>
                    Design for mobile devices first, then enhance for larger screens. This ensures optimal performance
                    and usability across all devices.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Requirements
              </CardTitle>
              <CardDescription>Define your target users and their specific needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="user-personas">Target User Personas</Label>
                <Textarea
                  id="user-personas"
                  placeholder="Describe your target users: DeFi beginners, experienced traders, institutional users, etc."
                  value={userPersonas}
                  onChange={(e) => setUserPersonas(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="design-requirements">Specific Design Requirements</Label>
                <Textarea
                  id="design-requirements"
                  placeholder="Any specific design requirements, accessibility needs, or compliance considerations..."
                  value={designRequirements}
                  onChange={(e) => setDesignRequirements(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Tools & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Figma className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Figma Templates</div>
                    <div className="text-sm text-muted-foreground">Ready-to-use DEX designs</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Download className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-medium">Design System</div>
                    <div className="text-sm text-muted-foreground">Component library & guidelines</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Step */}
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          )}
          <span className="text-sm">
            {isComplete ? "UI/UX design complete" : "Complete theme selection and branding to continue"}
          </span>
        </div>
        <Button onClick={onComplete} disabled={!isComplete}>
          Complete UI/UX Design
        </Button>
      </div>
    </div>
  )
}
