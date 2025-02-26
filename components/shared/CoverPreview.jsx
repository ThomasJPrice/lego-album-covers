'use client'
import React, { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const COLOUR_PALETTE = [
  '#DBDDDF', '#C1C5C6', '#979DA4', '#49565D', '#252729', '#ABADC0', '#191F26',
  '#181A1E', '#D7CFC6', '#D2CABE', '#D0C5B7', '#CEC0A9', '#CBBAAF', '#C19B7D',
  '#B27C58', '#AF6C2C', '#441908', '#1D1108', '#C3BD9A', '#8F8357', '#E3D9A6',
  '#E4CA02', '#BB9414', '#E1C108', '#CF7300', '#D5C8D1', '#D3A8CD', '#B25297',
  '#9E0753', '#B10B01', '#680600', '#A1857B', '#9686B2', '#1F1581', '#8CB7D6',
  '#3D9BC2', '#26B2D0', '#0967C4', '#0991C5', '#0045B2', '#01051C', '#3D5E7E',
  '#ACC7A0', '#7CAD09', '#07B153', '#027A36', '#7A8A54', '#679C96', '#030706',
  '#030B04'
] // Example palette

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

const colourDistance = (rgb1, rgb2) => {
  return Math.sqrt(
    (rgb1[0] - rgb2[0]) ** 2 +
    (rgb1[1] - rgb2[1]) ** 2 +
    (rgb1[2] - rgb2[2]) ** 2
  )
}

const findClosestColour = (rgb) => {
  return COLOUR_PALETTE.reduce((closest, current) => {
    return colourDistance(rgb, hexToRgb(current)) < colourDistance(rgb, hexToRgb(closest))
      ? current
      : closest
  }, COLOUR_PALETTE[0])
}

const CoverPreview = () => {
  const [query, setQuery] = useState('')
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [pixelGrid, setPixelGrid] = useState([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) return
    const fetchAlbums = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(`/api/deezer-search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setAlbums(data?.data || [])
      } catch (error) {
        console.error("Error fetching albums:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAlbums()
  }, [query])

  useEffect(() => {
    if (!selectedAlbum) return
    const processImage = async () => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = selectedAlbum.cover_big
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 32
        canvas.height = 32
        ctx.drawImage(img, 0, 0, 32, 32)
        const imageData = ctx.getImageData(0, 0, 32, 32).data
        const grid = []
        for (let i = 0; i < imageData.length; i += 4) {
          const rgb = [imageData[i], imageData[i + 1], imageData[i + 2]]
          grid.push(findClosestColour(rgb))
        }
        setPixelGrid(grid)
      }
    }
    processImage()
  }, [selectedAlbum])

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[250px] justify-between">
            {selectedAlbum ? selectedAlbum.title : "Select an album..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search albums..." onValueChange={setQuery} value={query} />
            <CommandList>
              {isLoading ? (
                <div className='py-4 flex justify-center'>
                  <LoaderCircle className='animate-spin' />
                </div>
              ) : (
                <>
                  <CommandEmpty>No albums found.</CommandEmpty>
                  <CommandGroup>
                    {albums.map((album) => (
                      <CommandItem
                        key={album.id}
                        value={album.title}
                        onSelect={() => {
                          setSelectedAlbum(album)
                          setOpen(false)
                        }}
                      >
                        {album.title} - {album.artist.name}
                        {/* <Check className={selectedAlbum?.id === album.id ? "opacity-100 ml-auto" : "opacity-0 ml-auto"} /> */}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex space-x-2">
        <Button onClick={() => setSelectedAlbum(selectedAlbum)} disabled={!selectedAlbum}>Generate</Button>
        <Button variant="destructive" onClick={() => { setSelectedAlbum(null); setPixelGrid([]); }}>Clear</Button>
      </div>
      {selectedAlbum && (
        <div>
          <p>Before:</p>
          <img src={selectedAlbum.cover_big} alt={selectedAlbum.title} width={351} height={351} />
          <p>After (Pixelated):</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(32, 1fr)',
            width: '320px',
            height: '320px'
          }}>
            {pixelGrid.map((colour, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colour,
                  width: '10px',
                  height: '10px',
                  position: 'relative' // Needed for stud positioning
                }}
              >
                {/* LEGO stud */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '4px',
                  height: '4px',
                  backgroundColor: 'rgba(255,255,255,0.3)', // Light highlight effect
                  borderRadius: '50%', // Makes it circular
                  transform: 'translate(-50%, -50%)' // Centers it
                }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoverPreview
