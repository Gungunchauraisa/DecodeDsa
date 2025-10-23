import { useEffect, useRef, useState, useCallback } from "react"
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react"

interface ArrayElement {
    value: number
    index: number
    color: string
}

interface ZoomableArrayCanvasProps {
    elements: ArrayElement[]
    width?: number
    height?: number
    onElementClick?: (index: number) => void
}

const ZoomableArrayCanvas: React.FC<ZoomableArrayCanvasProps> = ({
                                                                     elements,
                                                                     width = 800,
                                                                     height = 200,
                                                                     onElementClick,
                                                                 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)

    const elementWidth = 48
    const elementHeight = 48
    const elementGap = 8
    const labelHeight = 20

    const totalContentWidth = elements.length * (elementWidth + elementGap) - elementGap
    const contentHeight = elementHeight + labelHeight + 20

    const drawArray = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = width
        canvas.height = height

        ctx.clearRect(0, 0, width, height)
        ctx.save()
        ctx.translate(pan.x, pan.y)
        ctx.scale(zoom, zoom)

        const visibleStartX = -pan.x / zoom
        const visibleEndX = (-pan.x + width) / zoom
        const startIndex = Math.max(0, Math.floor(visibleStartX / (elementWidth + elementGap)))
        const endIndex = Math.min(
            elements.length,
            Math.ceil(visibleEndX / (elementWidth + elementGap)) + 1
        )

        ctx.fillStyle = "#f8fafc"
        ctx.fillRect(0, 0, totalContentWidth, contentHeight)

        for (let i = startIndex; i < endIndex; i++) {
            const element = elements[i]
            const x = i * (elementWidth + elementGap)
            const y = 10

            ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 2

            ctx.fillStyle = element.color
            ctx.fillRect(x, y, elementWidth, elementHeight)

            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0

            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, elementWidth, elementHeight)

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 16px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(
                element.value.toString(),
                x + elementWidth / 2,
                y + elementHeight / 2
            )

            ctx.fillStyle = "#64748b"
            ctx.font = "12px Arial"
            ctx.fillText(
                element.index.toString(),
                x + elementWidth / 2,
                y + elementHeight + 15
            )
        }

        ctx.restore()

        ctx.strokeStyle = "#cbd5e1"
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, width, height)
    }, [elements, zoom, pan, width, height, totalContentWidth, contentHeight, elementWidth, elementGap, elementHeight])

    useEffect(() => {
        drawArray()
    }, [drawArray])

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5))
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.1))
    const handleResetView = () => {
        setZoom(1)
        setPan({ x: 0, y: 0 })
    }
    const handleFitToView = () => {
        const scaleX = (width - 40) / totalContentWidth
        const scaleY = (height - 40) / contentHeight
        const newZoom = Math.min(scaleX, scaleY, 1)
        setZoom(newZoom)
        setPan({ x: 20, y: (height - contentHeight * newZoom) / 2 })
    }

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
        },
        []
    )

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning || elements.length >= 100) {
            setIsDragging(true)
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            })
        }
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => setIsDragging(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.addEventListener("wheel", handleWheel, { passive: false })
        return () => canvas.removeEventListener("wheel", handleWheel)
    }, [handleWheel])

    useEffect(() => {
        if (elements.length >= 100) handleFitToView()
    })

    return (
        <div ref={containerRef} className="relative">
            <canvas
                ref={canvasRef}
                className={`border border-gray-300 rounded-lg bg-gray-50 ${
                    isDragging ? "cursor-grabbing" : isPanning ? "cursor-grab" : "cursor-default"
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ display: "block", width: "100%", maxWidth: `${width}px` }}
            />

            {elements.length >= 100 && (
                <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Zoom In (Scroll Up)">
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Zoom Out (Scroll Down)">
                        <ZoomOut className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={handleFitToView} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Fit to View">
                        <Maximize2 className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={handleResetView} className="p-2 hover:bg-gray-100 rounded transition-colors" title="Reset View">
                        <Move className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={() => setIsPanning(!isPanning)} className={`p-2 rounded transition-colors ${isPanning ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`} title="Toggle Pan Mode">
                        <Move className="w-5 h-5" />
                    </button>
                </div>
            )}

            {elements.length >= 100 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-gray-200">
                    <div className="text-xs text-gray-600 flex items-center gap-3">
                        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Elements: {elements.length}</span>
                        <span>•</span>
                        <span className="text-blue-600">Scroll to zoom • Drag to pan</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ZoomableArrayCanvas
