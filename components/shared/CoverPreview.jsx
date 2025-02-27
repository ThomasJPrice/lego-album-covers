'use client'
import React, { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COLOUR_PALETTE } from '@/lib/constants'

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

// bias for luminance

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
  const [pixelGrid32, setPixelGrid32] = useState([])
  const [pixelGrid48, setPixelGrid48] = useState([])
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
    const processImage = async (size, setGrid) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = selectedAlbum.cover_big
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size).data
        const grid = []
        for (let i = 0; i < imageData.length; i += 4) {
          const rgb = [imageData[i], imageData[i + 1], imageData[i + 2]]
          grid.push(findClosestColour(rgb))
        }
        setGrid(grid)
      }
    }
    processImage(32, setPixelGrid32)
    processImage(48, setPixelGrid48)
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
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedAlbum && (
        <div>
          <p>Before:</p>
          <img src={selectedAlbum.cover_big} alt={selectedAlbum.title} width={351} height={351} />
          <p>After (Pixelated):</p>
          <div className="flex space-x-4">
            {[{ size: 32, grid: pixelGrid32 }, { size: 48, grid: pixelGrid48 }].map(({ size, grid }) => (
              <div key={size}>
                <p>{size}x{size}</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${size}, 1fr)`,
                  width: `${size * 10}px`,
                  height: `${size * 10}px`
                }}>
                  {grid.map((colour, index) => (
                    <div key={index} style={{ backgroundColor: colour, width: '10px', height: '10px' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CoverPreview
