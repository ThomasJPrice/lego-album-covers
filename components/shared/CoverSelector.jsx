'use client'

import React, { useEffect, useState } from 'react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, LoaderCircle } from 'lucide-react'
import { processAlbumCover } from '@/lib/utils'

const CoverSelector = () => {
  const [query, setQuery] = useState('')
  const [albumResults, setAlbumResults] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [pixelGrid32, setPixelGrid32] = useState([])
  const [pixelGrid48, setPixelGrid48] = useState([])

  // for selecting the album
  useEffect(() => {
    if (query.length < 3) return
    const fetchAlbums = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deezer-search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setAlbumResults(data?.data || [])
      } catch (error) {
        console.error("Error fetching albums:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAlbums()
  }, [query])

  useEffect(() => {
    if (!selectedAlbum) return
    processAlbumCover(selectedAlbum.cover_medium, 32, setPixelGrid32)
    processAlbumCover(selectedAlbum.cover_medium, 48, setPixelGrid48)
  }, [selectedAlbum])

  return (
    <div className="mt-4">
      {/* Album Selection */}
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="min-w-[250px] justify-between"
            >
              {selectedAlbum ? selectedAlbum.title : "Select an album..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 min-w-[250px]">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search albums..."
                onValueChange={setQuery}
                value={query}
              />
              <CommandList>
                {loading ? (
                  <div className="py-4 flex justify-center">
                    <LoaderCircle className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <CommandEmpty>No albums found.</CommandEmpty>
                    <CommandGroup>
                      {albumResults.map((album) => (
                        <CommandItem
                          key={album.id}
                          value={album.title}
                          onSelect={() => {
                            setSelectedAlbum(album);
                            setOpen(false);
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

        <Button variant="destructive" onClick={() => setSelectedAlbum(null)}>
          Clear
        </Button>
      </div>

      {/* Album Display */}
      {selectedAlbum && (
        <div className="mt-6 flex flex-wrap md:flex-nowrap justify-center gap-6">
          {/* Original Album Cover */}
          <div className="flex flex-col items-center flex-shrink-0">
            <p className="mb-2 font-semibold">Original</p>
            <img
              src={selectedAlbum.cover_big}
              alt={selectedAlbum.title}
              width={351}
              height={351}
              className='flex-shrink-0'
            />
          </div>

          {/* Grids Section */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* 32x32 Grid */}
            <div className="flex flex-col items-center">
              <p className="font-semibold mb-2">32x32</p>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(32, 1fr)",
                  // width: "351px",
                  // height: "351px",
                }}
              >
                {pixelGrid32.map((colour, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: `${colour}`,
                    }}
                    className="w-[6px] md:w-[10px] h-[6px] md:h-[10px]"
                  />
                ))}
              </div>
            </div>

            {/* 48x48 Grid */}
            <div className="flex flex-col items-center">
              <p className="font-semibold mb-2">48x48</p>
              <div
                className="grid max-w-full"
                style={{
                  gridTemplateColumns: "repeat(48, 1fr)",
                }}
              >
                {pixelGrid48.map((colour, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: `${colour}`,
                    }}
                    className="w-[6px] md:w-[10px] h-[6px] md:h-[10px]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default CoverSelector