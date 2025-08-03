# Game Engine Core Architecture

## ⚙️ **Core Game Engine Structure**

```mermaid
classDiagram
    class GameEngine {
        +gameState: GameState
        +renderer: Renderer
        +audioManager: AudioManager
        +inputManager: InputManager
        +physicsEngine: PhysicsEngine
        +assetManager: AssetManager
        +sceneManager: SceneManager
        +update(deltaTime: number): void
        +render(): void
        +init(): void
        +destroy(): void
    }
    
    class GameState {
        +currentScene: Scene
        +entities: Entity[]
        +systems: System[]
        +time: number
        +isRunning: boolean
        +update(deltaTime: number): void
        +addEntity(entity: Entity): void
        +removeEntity(entity: Entity): void
    }
    
    class Entity {
        +id: string
        +components: Component[]
        +transform: Transform
        +active: boolean
        +addComponent(component: Component): void
        +getComponent(type: string): Component
        +removeComponent(type: string): void
        +update(deltaTime: number): void
    }
    
    class Component {
        <<abstract>>
        +entity: Entity
        +enabled: boolean
        +init(): void
        +update(deltaTime: number): void
        +destroy(): void
    }
    
    class Transform {
        +position: Vector2
        +rotation: number
        +scale: Vector2
        +parent: Transform
        +children: Transform[]
        +getWorldPosition(): Vector2
        +getWorldRotation(): number
        +setParent(parent: Transform): void
    }
    
    class System {
        <<abstract>>
        +entities: Entity[]
        +enabled: boolean
        +init(): void
        +update(deltaTime: number): void
        +addEntity(entity: Entity): void
        +removeEntity(entity: Entity): void
    }
    
    class Renderer {
        +canvas: HTMLCanvasElement
        +context: CanvasRenderingContext2D
        +camera: Camera
        +layers: RenderLayer[]
        +init(): void
        +render(scene: Scene): void
        +addLayer(layer: RenderLayer): void
        +setCamera(camera: Camera): void
    }
    
    class AudioManager {
        +audioContext: AudioContext
        +sounds: Map<string, AudioBuffer>
        +music: AudioBuffer
        +volume: number
        +init(): void
        +playSound(name: string): void
        +playMusic(buffer: AudioBuffer): void
        +setVolume(volume: number): void
    }
    
    class InputManager {
        +keys: Map<string, boolean>
        +mouse: MouseState
        +touch: TouchState
        +gamepad: GamepadState
        +init(): void
        +update(): void
        +isKeyPressed(key: string): boolean
        +isMousePressed(button: number): boolean
    }
    
    class PhysicsEngine {
        +gravity: Vector2
        +colliders: Collider[]
        +bodies: RigidBody[]
        +update(deltaTime: number): void
        +addBody(body: RigidBody): void
        +removeBody(body: RigidBody): void
        +checkCollision(body1: RigidBody, body2: RigidBody): Collision
    }
    
    class AssetManager {
        +textures: Map<string, Texture>
        +audio: Map<string, AudioBuffer>
        +fonts: Map<string, Font>
        +loadTexture(path: string): Promise<Texture>
        +loadAudio(path: string): Promise<AudioBuffer>
        +loadFont(path: string): Promise<Font>
        +getTexture(name: string): Texture
    }
    
    class SceneManager {
        +scenes: Map<string, Scene>
        +currentScene: Scene
        +loadingScene: Scene
        +init(): void
        +addScene(name: string, scene: Scene): void
        +loadScene(name: string): Promise<void>
        +getCurrentScene(): Scene
    }
    
    %% Relationships
    GameEngine --> GameState
    GameEngine --> Renderer
    GameEngine --> AudioManager
    GameEngine --> InputManager
    GameEngine --> PhysicsEngine
    GameEngine --> AssetManager
    GameEngine --> SceneManager
    
    GameState --> Entity
    GameState --> System
    
    Entity --> Component
    Entity --> Transform
    
    System --> Entity
    
    Renderer --> SceneManager
    AudioManager --> AssetManager
    InputManager --> GameState
    PhysicsEngine --> Entity
    AssetManager --> Renderer
    SceneManager --> GameState
```

## 🔄 **Game Loop Architecture**

```mermaid
sequenceDiagram
    participant Main
    participant GameEngine
    participant GameState
    participant Systems
    participant Renderer
    participant AudioManager
    
    Main->>GameEngine: init()
    GameEngine->>GameState: init()
    GameEngine->>Renderer: init()
    GameEngine->>AudioManager: init()
    
    loop Game Loop
        Main->>GameEngine: update(deltaTime)
        GameEngine->>GameState: update(deltaTime)
        GameState->>Systems: update(deltaTime)
        Systems->>Systems: process entities
        Systems-->>GameState: updated
        GameState-->>GameEngine: updated
        
        GameEngine->>Renderer: render()
        Renderer->>Renderer: clear canvas
        Renderer->>Renderer: render entities
        Renderer->>Renderer: render UI
        Renderer-->>GameEngine: rendered
        
        GameEngine->>AudioManager: update()
        AudioManager->>AudioManager: process audio
        AudioManager-->>GameEngine: updated
        
        GameEngine-->>Main: frame complete
    end
    
    Main->>GameEngine: destroy()
    GameEngine->>GameState: destroy()
    GameEngine->>Renderer: destroy()
    GameEngine->>AudioManager: destroy()
```

## 🎯 **Component System Architecture**

```mermaid
graph TB
    subgraph "🎮 Game Engine Core"
        subgraph "📦 Entity Component System"
            ENTITY[Entity]
            COMPONENT[Component]
            SYSTEM[System]
        end
        
        subgraph "🎨 Rendering System"
            RENDERER[Renderer]
            CAMERA[Camera]
            SPRITE[Sprite Component]
            ANIMATION[Animation Component]
        end
        
        subgraph "🎵 Audio System"
            AUDIO_MGR[Audio Manager]
            SOUND[Sound Component]
            MUSIC[Music Component]
        end
        
        subgraph "🎮 Input System"
            INPUT_MGR[Input Manager]
            CONTROLLER[Controller Component]
            AI[AI Component]
        end
        
        subgraph "⚡ Physics System"
            PHYSICS[Physics Engine]
            RIGIDBODY[RigidBody Component]
            COLLIDER[Collider Component]
        end
        
        subgraph "🎯 Game Logic"
            HEALTH[Health Component]
            COMBAT[Combat Component]
            MOVEMENT[Movement Component]
        end
    end
    
    %% Entity Component Relationships
    ENTITY --> COMPONENT
    COMPONENT --> SYSTEM
    
    %% Rendering Relationships
    SPRITE --> RENDERER
    ANIMATION --> RENDERER
    CAMERA --> RENDERER
    
    %% Audio Relationships
    SOUND --> AUDIO_MGR
    MUSIC --> AUDIO_MGR
    
    %% Input Relationships
    CONTROLLER --> INPUT_MGR
    AI --> INPUT_MGR
    
    %% Physics Relationships
    RIGIDBODY --> PHYSICS
    COLLIDER --> PHYSICS
    
    %% Game Logic Relationships
    HEALTH --> COMBAT
    MOVEMENT --> PHYSICS
    COMBAT --> AUDIO_MGR
    
    %% Cross-system Relationships
    SPRITE --> ENTITY
    SOUND --> ENTITY
    CONTROLLER --> ENTITY
    RIGIDBODY --> ENTITY
    HEALTH --> ENTITY
    
    classDef core fill:#87CEEB,stroke:#000080,stroke-width:3px
    classDef rendering fill:#90EE90,stroke:#006400,stroke-width:2px
    classDef audio fill:#F0E68C,stroke:#B8860B,stroke-width:2px
    classDef input fill:#FFA500,stroke:#FF8C00,stroke-width:2px
    classDef physics fill:#DDA0DD,stroke:#800080,stroke-width:2px
    classDef logic fill:#FFB6C1,stroke:#DC143C,stroke-width:2px
    
    class ENTITY,COMPONENT,SYSTEM core
    class RENDERER,CAMERA,SPRITE,ANIMATION rendering
    class AUDIO_MGR,SOUND,MUSIC audio
    class INPUT_MGR,CONTROLLER,AI input
    class PHYSICS,RIGIDBODY,COLLIDER physics
    class HEALTH,COMBAT,MOVEMENT logic
```

## 🏗️ **System Dependencies**

```mermaid
graph LR
    subgraph "🎯 Core Systems"
        ENGINE[Game Engine]
        STATE[Game State]
        ENTITY[Entity Manager]
    end
    
    subgraph "🎨 Rendering Pipeline"
        RENDER[Renderer]
        CAMERA[Camera]
        LAYERS[Render Layers]
        SHADERS[Shaders]
    end
    
    subgraph "🎵 Audio Pipeline"
        AUDIO[Audio Manager]
        MIXER[Audio Mixer]
        EFFECTS[Audio Effects]
        SPATIAL[Spatial Audio]
    end
    
    subgraph "🎮 Input Pipeline"
        INPUT[Input Manager]
        KEYBOARD[Keyboard]
        MOUSE[Mouse]
        GAMEPAD[Gamepad]
        TOUCH[Touch]
    end
    
    subgraph "⚡ Physics Pipeline"
        PHYSICS[Physics Engine]
        COLLISION[Collision Detection]
        FORCES[Force System]
        CONSTRAINTS[Constraints]
    end
    
    subgraph "🎯 Game Logic"
        COMBAT[Combat System]
        AI[AI System]
        PARTICLE[Particle System]
        UI[UI System]
    end
    
    %% Core Dependencies
    ENGINE --> STATE
    STATE --> ENTITY
    
    %% Rendering Dependencies
    RENDER --> CAMERA
    CAMERA --> LAYERS
    LAYERS --> SHADERS
    
    %% Audio Dependencies
    AUDIO --> MIXER
    MIXER --> EFFECTS
    EFFECTS --> SPATIAL
    
    %% Input Dependencies
    INPUT --> KEYBOARD
    INPUT --> MOUSE
    INPUT --> GAMEPAD
    INPUT --> TOUCH
    
    %% Physics Dependencies
    PHYSICS --> COLLISION
    COLLISION --> FORCES
    FORCES --> CONSTRAINTS
    
    %% Game Logic Dependencies
    COMBAT --> PHYSICS
    AI --> INPUT
    PARTICLE --> RENDER
    UI --> RENDER
    
    %% Cross-system Dependencies
    ENTITY --> RENDER
    ENTITY --> AUDIO
    ENTITY --> INPUT
    ENTITY --> PHYSICS
    ENTITY --> COMBAT
    
    classDef core fill:#87CEEB,stroke:#000080,stroke-width:3px
    classDef rendering fill:#90EE90,stroke:#006400,stroke-width:2px
    classDef audio fill:#F0E68C,stroke:#B8860B,stroke-width:2px
    classDef input fill:#FFA500,stroke:#FF8C00,stroke-width:2px
    classDef physics fill:#DDA0DD,stroke:#800080,stroke-width:2px
    classDef logic fill:#FFB6C1,stroke:#DC143C,stroke-width:2px
    
    class ENGINE,STATE,ENTITY core
    class RENDER,CAMERA,LAYERS,SHADERS rendering
    class AUDIO,MIXER,EFFECTS,SPATIAL audio
    class INPUT,KEYBOARD,MOUSE,GAMEPAD,TOUCH input
    class PHYSICS,COLLISION,FORCES,CONSTRAINTS physics
    class COMBAT,AI,PARTICLE,UI logic
```

---
*Erstellt: 2024-08-02*
*Diagramm-Typ: Game Engine Core Architecture* 