export interface SettingsInterface {
    source?: string
    override?: boolean
    mimetype?: string,
    imageRendering?: 'auto' | 'smooth' | 'high-quality' | 'crisp-edges' | 'pixelated',
    objectFit?: 'none' | 'fill' | 'contain' | 'scale-down' | 'cover',
    objectPosition?: string,
    isLocal?: boolean,
    localSource?: string,
    refresher?: number,
    naturalWidth?: number,
    naturalHeight?: number,
    style?: string,
}

export const renderTypes = ['auto', 'smooth', 'high-quality', 'crisp-edges', 'pixelated']

export const fitTypes = ['fill', 'contain', 'scale-down', 'cover', 'none']