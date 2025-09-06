"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  Code,
  FileText
} from "lucide-react"

interface HtmlEditorProps {
  onBack: () => void
  itineraryData?: {
    name: string
    productId: string
    description?: string
  }
}

export function HtmlEditor({ onBack, itineraryData }: HtmlEditorProps) {
  const [htmlContent, setHtmlContent] = useState(`
<h1>Welcome to ${itineraryData?.name || "Your Itinerary"}</h1>
<p>This is a sample HTML itinerary. You can edit this content using HTML tags.</p>

<h2>Day 1: Arrival</h2>
<p>Arrive at your destination and check into your hotel.</p>
<ul>
  <li>Airport pickup</li>
  <li>Hotel check-in</li>
  <li>Welcome dinner</li>
</ul>

<h2>Day 2: Sightseeing</h2>
<p>Explore the local attractions and enjoy guided tours.</p>
<ol>
  <li>Morning: City tour</li>
  <li>Afternoon: Museum visit</li>
  <li>Evening: Local market</li>
</ol>

<h3>Important Notes</h3>
<p><strong>What to bring:</strong></p>
<ul>
  <li>Comfortable walking shoes</li>
  <li>Camera</li>
  <li>Sunscreen</li>
</ul>

<p><em>For any questions, contact our support team.</em></p>
  `.trim())

  const insertHtmlTag = (tag: string, isClosing = false) => {
    const textarea = document.getElementById('html-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = htmlContent.substring(start, end)
    
    let replacement = ""
    
    switch (tag) {
      case 'h1':
        replacement = selectedText ? `<h1>${selectedText}</h1>` : `<h1>Heading 1</h1>`
        break
      case 'h2':
        replacement = selectedText ? `<h2>${selectedText}</h2>` : `<h2>Heading 2</h2>`
        break
      case 'h3':
        replacement = selectedText ? `<h3>${selectedText}</h3>` : `<h3>Heading 3</h3>`
        break
      case 'p':
        replacement = selectedText ? `<p>${selectedText}</p>` : `<p>Paragraph text</p>`
        break
      case 'strong':
        replacement = selectedText ? `<strong>${selectedText}</strong>` : `<strong>Bold text</strong>`
        break
      case 'em':
        replacement = selectedText ? `<em>${selectedText}</em>` : `<em>Italic text</em>`
        break
      case 'u':
        replacement = selectedText ? `<u>${selectedText}</u>` : `<u>Underlined text</u>`
        break
      case 'ul':
        replacement = selectedText ? `<ul>\n  <li>${selectedText}</li>\n</ul>` : `<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>`
        break
      case 'ol':
        replacement = selectedText ? `<ol>\n  <li>${selectedText}</li>\n</ol>` : `<ol>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ol>`
        break
      default:
        return
    }

    const newContent = htmlContent.substring(0, start) + replacement + htmlContent.substring(end)
    setHtmlContent(newContent)
    
    // Set cursor position after the inserted tag
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + replacement.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleSave = async () => {
    const itineraryPayload = {
      ...itineraryData,
      title: itineraryData?.name || "HTML Itinerary",
      destination: "Various",
      countries: ["India"],
      duration: "Flexible",
      totalPrice: 0,
      currency: "INR",
      status: "draft",
      createdBy: "Current User",
      days: [],
      highlights: [],
      images: [],
      itineraryType: "html-editor",
      htmlContent,
    }

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itineraryPayload),
      })

      if (response.ok) {
        alert("HTML itinerary saved successfully!")
        onBack()
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Error saving HTML itinerary:", error)
      alert("Error saving HTML itinerary")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-brand-primary-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">HTML Text Editor</h1>
            <p className="text-gray-600">Create rich HTML content for your itinerary</p>
            {itineraryData && (
              <p className="text-sm text-gray-500 mt-1">
                Editing: {itineraryData.name} ({itineraryData.productId})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleSave}>
              <FileText className="h-4 w-4 mr-2" />
              Save HTML Itinerary
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>HTML Toolbar</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('h1')}
                    className="flex items-center gap-1"
                  >
                    <Heading1 className="h-4 w-4" />
                    H1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('h2')}
                    className="flex items-center gap-1"
                  >
                    <Heading2 className="h-4 w-4" />
                    H2
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('h3')}
                    className="flex items-center gap-1"
                  >
                    <Heading3 className="h-4 w-4" />
                    H3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('p')}
                  >
                    P
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('strong')}
                    className="flex items-center gap-1"
                  >
                    <Bold className="h-4 w-4" />
                    Bold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('em')}
                    className="flex items-center gap-1"
                  >
                    <Italic className="h-4 w-4" />
                    Italic
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('u')}
                    className="flex items-center gap-1"
                  >
                    <Underline className="h-4 w-4" />
                    Underline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('ul')}
                    className="flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    Bullet List
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtmlTag('ol')}
                    className="flex items-center gap-1"
                  >
                    <ListOrdered className="h-4 w-4" />
                    Numbered List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="html-editor">HTML Content</Label>
                  <Textarea
                    id="html-editor"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Enter your HTML content here..."
                  />
                  <p className="text-xs text-gray-500">
                    Use the toolbar buttons above to insert HTML tags, or type HTML directly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  This is how your HTML content will appear to users.
                </p>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none bg-white p-6 rounded-lg border"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    lineHeight: '1.6',
                    color: '#333',
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* HTML Reference Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>HTML Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Headings</h4>
                <code className="block bg-gray-100 p-2 rounded mb-1">&lt;h1&gt;Main Title&lt;/h1&gt;</code>
                <code className="block bg-gray-100 p-2 rounded mb-1">&lt;h2&gt;Section Title&lt;/h2&gt;</code>
                <code className="block bg-gray-100 p-2 rounded">&lt;h3&gt;Subsection&lt;/h3&gt;</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Text Formatting</h4>
                <code className="block bg-gray-100 p-2 rounded mb-1">&lt;p&gt;Paragraph&lt;/p&gt;</code>
                <code className="block bg-gray-100 p-2 rounded mb-1">&lt;strong&gt;Bold&lt;/strong&gt;</code>
                <code className="block bg-gray-100 p-2 rounded">&lt;em&gt;Italic&lt;/em&gt;</code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Lists</h4>
                <code className="block bg-gray-100 p-2 rounded mb-1">&lt;ul&gt;&lt;li&gt;Item&lt;/li&gt;&lt;/ul&gt;</code>
                <code className="block bg-gray-100 p-2 rounded">&lt;ol&gt;&lt;li&gt;Item&lt;/li&gt;&lt;/ol&gt;</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}