# AGI drawing preferences

Use the 160x168 picture grid and standard 16 EGA colors. Account for wide display pixels when choosing proportions.

Use thin native-pixel contours, selective colored boundaries, and deliberate deep shadows. Avoid broad black bands around foliage. Break broad fills with purposeful material details and overlapping forms, without uniform noise.

Default to bilateral symmetry for objects expected to be balanced: plaques, shields, emblems, bells, jar bodies, barrel bodies and centered architectural features. Place them on an explicit native-pixel centerline and check the rendered pixel pairs, since polygon rasterization can introduce an uneven edge even with symmetric vertices. Keep light/shadow directional and organic scenery irregular where appropriate. Do not force perspective views into front-facing symmetry.

The belfry guild plaque is centered on native x116. Its frame, pointed base, hanging pin and gold bell emblem were checked for exact mirrored pixels.

Object priority: give solid props a ground footprint and a separate visible silhouette. Collision uses Rosella's foot samples at the object's base. Paint the prop over her only when her baseline is behind it; equal baselines put her in front. Derive transparent masks from authored command ownership so later scenery removes covered portions. Do not copy rectangular background patches or use color-only transparency masks. Keep live pickup items in the same depth group as their support surface, and verify the complete room routes after changing footprints.
