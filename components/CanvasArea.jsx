'use client'

import { useEffect, useState, useRef } from 'react'
import styles from './CanvasArea.module.css'
import '@excalidraw/excalidraw/index.css'

export default function CanvasArea({ onCanvasUpdate, onThemeChange }) {
  const [mounted, setMounted] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  
  const [ExcalidrawComp, setExcalidrawComp] = useState(null)
  const [MainMenuComp, setMainMenuComp] = useState(null)

  useEffect(() => {
    import('@excalidraw/excalidraw').then(module => {
      setExcalidrawComp(() => module.Excalidraw)
      setMainMenuComp(() => module.MainMenu)
    })
    setMounted(true)
  }, [])
  
  const onCanvasUpdateRef = useRef(onCanvasUpdate)
  useEffect(() => {
    onCanvasUpdateRef.current = onCanvasUpdate
  }, [onCanvasUpdate])

  useEffect(() => {
    setMounted(true)
    // Fetch the library items
    fetch('/system-design.excalidrawlib')
      .then(res => res.json())
      .then(data => {
        if (data && data.library && excalidrawAPI) {
          excalidrawAPI.updateLibrary({ libraryItems: data.library })
        }
      })
      .catch(err => console.error("Failed to load excalidraw library", err))
  }, [excalidrawAPI])

  // We debounce the onChange to send updates to the backend
  const timeoutId = useRef(null)
  
  const handleOnChange = (elements, appState) => {
    if (onThemeChange) {
      onThemeChange(appState.theme)
    }

    clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(() => {
      
      const groups = {}
      const independent = []
      
      elements.forEach(el => {
        // We do not group arrows so they can be processed for topology
        if (el.type !== 'arrow' && el.groupIds && el.groupIds.length > 0) {
          const topLevelId = el.groupIds[el.groupIds.length - 1]
          if (!groups[topLevelId]) groups[topLevelId] = []
          groups[topLevelId].push(el)
        } else {
          independent.push(el)
        }
      })
      
      const simplifiedShapes = []
      
      // Merge grouped elements into single components
      Object.keys(groups).forEach(groupId => {
        const groupEls = groups[groupId]
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        let combinedText = []
        
        groupEls.forEach(el => {
          minX = Math.min(minX, el.x)
          minY = Math.min(minY, el.y)
          maxX = Math.max(maxX, el.x + (el.width || 0))
          maxY = Math.max(maxY, el.y + (el.height || 0))
          if (el.type === 'text' && el.text) combinedText.push(el.text)
        })
        
        simplifiedShapes.push({
          id: groupId,
          type: 'component',
          x: Math.round(minX),
          y: Math.round(minY),
          w: Math.round(maxX - minX),
          h: Math.round(maxY - minY),
          text: combinedText.join(' ').trim(),
          startTargetId: null,
          endTargetId: null
        })
      })

      // Process independent elements
      independent.forEach(el => {
        const isEmbedded = el.type === 'text' && !!el.containerId
        if (isEmbedded) return

        let text = ''
        if (el.type === 'text') {
          text = el.text || ''
        } else if (el.boundElements) {
          const boundTexts = el.boundElements.filter(b => b.type === 'text')
          text = boundTexts.map(b => {
             const tEl = elements.find(e => e.id === b.id)
             return tEl ? tEl.text : ''
          }).join(' ')
        }

        // Ignore purely decorative lines that aren't arrows
        if (el.type === 'line') return

        simplifiedShapes.push({
          id: el.id,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          w: Math.round(el.width),
          h: Math.round(el.height),
          text: text.trim(),
          startTargetId: el.startBinding?.elementId || null,
          endTargetId: el.endBinding?.elementId || null,
          startX: (el.points && el.points.length > 0) ? el.points[0][0] : 0,
          startY: (el.points && el.points.length > 0) ? el.points[0][1] : 0,
          endX: (el.points && el.points.length > 1) ? el.points[el.points.length-1][0] : 0,
          endY: (el.points && el.points.length > 1) ? el.points[el.points.length-1][1] : 0,
        })
      })

      // Excalidraw tracks bindings directly on the arrow elements (startBinding/endBinding)
      onCanvasUpdateRef.current({ shapes: simplifiedShapes, bindings: [] })
    }, 2000) // Poll/update every 2 seconds of inactivity
  }

  if (!mounted || !ExcalidrawComp || !MainMenuComp) return null

  return (
    <div className={styles.canvasContainer}>
      <ExcalidrawComp 
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={handleOnChange}
      >
        <MainMenuComp>
          <MainMenuComp.DefaultItems.SaveAsImage />
          <MainMenuComp.DefaultItems.Export />
          <MainMenuComp.DefaultItems.ClearCanvas />
          <MainMenuComp.DefaultItems.ChangeCanvasBackground />
          <MainMenuComp.DefaultItems.ToggleTheme />
        </MainMenuComp>
      </ExcalidrawComp>
    </div>
  )
}
