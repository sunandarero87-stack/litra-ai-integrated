import sys
from PIL import Image

def remove_background(input_path, output_path, tolerance=230):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    width, height = img.size
    
    # We want to remove the background starting from the corners
    visited = set()
    queue = []
    
    # Add corners to the queue
    for x in [0, width - 1]:
        for y in [0, height - 1]:
            queue.append((x, y))
            visited.add((x, y))
            
    pixels = img.load()
    
    while queue:
        x, y = queue.pop(0)
        r, g, b, a = pixels[x, y]
        
        # If pixel is close to white
        if r > tolerance and g > tolerance and b > tolerance:
            # Make it transparent
            pixels[x, y] = (r, g, b, 0)
            
            # Add neighbors to queue
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Apply a light feather on alpha channel for edges
    for x in range(width):
        for y in range(height):
            if pixels[x, y][3] != 0:
                # check neighbors to see if it is edge
                is_edge = False
                for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        if pixels[nx, ny][3] == 0:
                            is_edge = True
                            break
                if is_edge:
                    # soften edge
                    r, g, b, a = pixels[x, y]
                    pixels[x, y] = (r, g, b, min(a, 128))

    img.save(output_path, format="PNG")
    print(f"Saved to {output_path}")

remove_background(sys.argv[1], sys.argv[2])
