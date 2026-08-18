#!/bin/bash
# Generate simple colored PNG icons for the extension using ImageMagick or a canvas-based approach
# If convert is available, use it; otherwise create minimal valid PNGs

for size in 16 32 48 128; do
  python3 -c "
import struct, zlib
def create_png(width, height, r, g, b):
    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    header = b'\\x89PNG\\r\\n\\x1a\\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))

    raw = b''
    for y in range(height):
        raw += b'\\x00'  # filter: none
        for x in range(width):
            raw += bytes([r, g, b])

    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

# Indigo color (#6366f1)
png = create_png($size, $size, 99, 102, 241)
with open('src/icons/icon${size}.png', 'wb') as f:
    f.write(png)
print(f'Created icon${size}.png ({$size}x${size})')
"
done
