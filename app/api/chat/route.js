import { Groq } from 'groq-sdk'

// A module-level variable to keep track of the current key index.
// In a serverless environment this will reset occasionally when the instance restarts,
// but it will maintain a cyclic distribution during active periods.
let currentKeyIndex = 0;

export async function POST(req) {
  try {
    const { shapes, bindings, userText, transcript } = await req.json()
    
    // DEBUG: Dump shapes to a file so we can inspect the exact Tldraw richText structure
    require('fs').writeFileSync('c:\\Users\\aniru\\Documents\\System-Design\\shapes-debug.json', JSON.stringify({ shapes, bindings }, null, 2))
    
    // Retrieve all configured API keys
    const keys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3
    ].filter(Boolean) // Remove any undefined/empty keys

    if (keys.length === 0) {
      return Response.json({ reply: "I'm sorry, no Groq API keys are configured. Please add them to your .env.local file." })
    }

    // Build a spatial/topological summary of the canvas
    let canvasSummary = 'The canvas is currently empty.'
    
    if (shapes && shapes.length > 0) {
      const shapeMap = {}
      shapes.forEach(s => { shapeMap[s.id] = s })
      
      // Separate shapes
      const standaloneTexts = shapes.filter(s => s.type === 'text')
      const arrows = shapes.filter(s => s.type === 'arrow')
      const nodes = shapes.filter(s => s.type !== 'text' && s.type !== 'arrow')
      
      // Resolve arrow connections from bindings
      arrows.forEach(a => {
        const startBinding = (bindings || []).find(b => b.fromId === a.id && b.terminal === 'start')
        const endBinding = (bindings || []).find(b => b.fromId === a.id && b.terminal === 'end')
        if (startBinding) a.startTargetId = startBinding.toId
        if (endBinding) a.endTargetId = endBinding.toId
        
        // Fallback: Infer connection for unbound arrows
        const findNearestNode = (x, y) => {
          let nearest = null; let minDist = 150;
          nodes.forEach(n => {
            // Compare to center of node (roughly)
            let nx = n.x + (n.w / 2)
            let ny = n.y + (n.h / 2)
            let dist = Math.sqrt(Math.pow(x - nx, 2) + Math.pow(y - ny, 2))
            if (dist < minDist) { minDist = dist; nearest = n.id }
          })
          return nearest
        }
        
        if (!a.startTargetId) a.startTargetId = findNearestNode(a.x + (a.startX || 0), a.y + (a.startY || 0))
        if (!a.endTargetId) a.endTargetId = findNearestNode(a.x + (a.endX || 0), a.y + (a.endY || 0))
      })
      
      // Heuristic: Bind free-floating text to nearest node/arrow
      standaloneTexts.forEach(txt => {
        let nearest = null
        let minDist = 300 // Search radius for nodes
        
        // Check nodes
        nodes.forEach(n => {
          let dist = Math.sqrt(Math.pow(txt.x - n.x, 2) + Math.pow(txt.y - n.y, 2))
          if (dist < minDist) { minDist = dist; nearest = n }
        })
        
        // Check arrows (use midpoint if bounded)
        arrows.forEach(a => {
          let ax = a.x
          let ay = a.y
          
          let startNode = shapeMap[a.startTargetId]
          let endNode = shapeMap[a.endTargetId]
          if (startNode && endNode) {
             ax = (startNode.x + endNode.x) / 2
             ay = (startNode.y + endNode.y) / 2
          }
          
          let dist = Math.sqrt(Math.pow(txt.x - ax, 2) + Math.pow(txt.y - ay, 2))
          if (dist < minDist && dist < 200) { minDist = dist; nearest = a }
        })
        
        if (nearest) {
          nearest.nearbyText = nearest.nearbyText ? nearest.nearbyText + " " + txt.text : txt.text
        }
      })
      
      let desc = "Architecture Topology:\n"
      
      nodes.forEach(n => {
        let label = n.text ? n.text : (n.nearbyText || `Unnamed ${n.type}`)
        desc += `- Node (${n.id}): [${label}] at (x:${n.x}, y:${n.y})\n`
      })
      
      arrows.forEach(a => {
        let label = a.text ? a.text : (a.nearbyText || `Arrow`)
        let startNode = shapeMap[a.startTargetId]
        let endNode = shapeMap[a.endTargetId]
        
        let startStr = startNode ? (startNode.text || startNode.nearbyText || startNode.id) : "Unknown origin"
        let endStr = endNode ? (endNode.text || endNode.nearbyText || endNode.id) : "Unknown destination"
        
        desc += `- Connection: [${label}] flows from [${startStr}] to [${endStr}]\n`
      })
      
      // If there are only standalone texts without nodes
      if (nodes.length === 0 && arrows.length === 0 && standaloneTexts.length > 0) {
         desc += standaloneTexts.map(t => `- Text: "${t.text}"`).join('\n')
      }
      
      canvasSummary = desc
    }

    // Build the system prompt
    const systemPrompt = `You are an expert Staff-level Software Engineer conducting a System Design Interview. 
The candidate is designing a system on a digital whiteboard.
You have access to a text representation of their whiteboard:
[Whiteboard State]: ${canvasSummary}

The candidate is using the following semantic shapes on the canvas:
| Shape/Prefix | Representation | Example |
|---|---|---|
| Rectangle | Service, API, component | Auth Service, API Gateway |
| Oval/Rounded | Process or server | Background Job |
| 🛢️ Cylinder / DB | Database or persistent storage | MySQL, Redis |
| Cloud | External service, cloud provider | AWS S3, Stripe |
| Diamond | Decision/condition | "User Exists?" |
| Circle | Event, start/end, connector | Kafka Event |
| 📄 Document | File or document | PDF, Log File |
| 📦 Box | Container, deployment unit, server | Docker Container |
| Arrow / Connection | Data flow, request, response | HTTP Request |
| 📬 Queue | Message queue | RabbitMQ, Kafka Topic |
| 💾 Disk | Storage volume | Local Disk, NAS |
| 👤 Person | User, client, admin | Customer |
| 🌐 Browser | Web client | Chrome |
| 📱 Phone | Mobile application | iOS App |

Follow this structured interview format:
1. **Welcome & Requirements**: If this is the beginning of the interview (the very first message), you MUST proactively CHOOSE a random System Design problem (e.g., URL Shortener, E-Commerce, Chat App, Ride-Sharing) and ASSIGN it to the candidate. Do NOT ask them what they want to design; you are the interviewer, YOU pick the topic and ask them to start!
2. **Context Awareness**: ALWAYS prioritize the CURRENT [Whiteboard State] over past chat history. If the candidate ignores your proposed problem and starts designing a completely different system on the whiteboard, you MUST adapt to their chosen system and evaluate what is currently drawn instead of complaining that they went off-topic.
3. **High-Level Design**: As they draw, evaluate if they have the core components for the system they are designing.
4. **Deep Dive & Course Correction**: Once the high-level design is sketched, ask about scaling/bottlenecks. Gently interrupt if they make a fundamental architectural mistake.
Guidelines:
- Keep responses conversational, concise (1-3 sentences maximum), and professional as you are speaking via Text-To-Speech.
- **When asked to review the design**, do not just list the components. Explain the architecture as a cohesive data flow narrative. Start from the user/client and trace the path (e.g., "I see a Client node that makes an API request to the Decision service, which then either queues the task or sends it to the Server.").
- If the user spoke, respond directly to their query.
- If the user is just drawing and making good progress, encourage them or ask the next logical question.`

    const messages = [
      { role: 'system', content: systemPrompt },
      // Include the last few messages for context
      ...transcript.slice(-5).map(m => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.text
      }))
    ]

    if (userText) {
      messages.push({ role: 'user', content: userText })
    } else {
      // If no user text (just a polling event from drawing), we instruct the model to evaluate the drawing.
      messages.push({ role: 'user', content: "(The candidate updated the whiteboard silently. You are watching them draw. You may offer a brief, helpful observation, ask a quick follow-up question about a newly added component, or provide a hint if they seem stuck. However, do NOT just restate what they drew. If they are just laying out basic components and you have nothing meaningful to add, reply with EXACTLY '...' to stay quiet.)" })
    }

    let completion
    let reply = ''
    let lastError = null

    // Try up to keys.length times to find a working key
    for (let attempts = 0; attempts < keys.length; attempts++) {
      const activeKey = keys[currentKeyIndex % keys.length]
      currentKeyIndex = (currentKeyIndex + 1) % keys.length
      
      try {
        const groq = new Groq({ apiKey: activeKey })
        completion = await groq.chat.completions.create({
          messages,
          model: 'llama-3.3-70b-versatile',
          temperature: 0.5,
          max_tokens: 150
        })
        reply = completion.choices[0]?.message?.content || ''
        lastError = null
        break // Success, exit retry loop
      } catch (err) {
        console.warn(`Groq key index ${(currentKeyIndex === 0 ? keys.length : currentKeyIndex) - 1} failed:`, err.message)
        lastError = err
      }
    }

    if (lastError) {
      throw lastError // If all keys failed, throw the last error to be caught by the outer catch block
    }

    // If the agent decides to stay quiet during a silent drawing update
    if (reply.trim() === '...') {
      return Response.json({ reply: null })
    }

    return Response.json({ reply })
    
  } catch (error) {
    console.error('Error with Groq API:', error)
    return Response.json({ reply: "I encountered an error while thinking. Let's continue." }, { status: 500 })
  }
}
