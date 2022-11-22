# Modules

## What are Modules?
Modules are standalone javascript packages that provide functionality to a Litch Overlay. There may be one or more of a given module.

## Litch <-> Module API
A built package that Litch is to load expects a single `dist/index.js` with an object as the default export. This allows the implementer of a module to use whatever build systems they prefer so long as they provide a final object that implements the following structures.

```typescript
export interface ModuleInterface {
	uuid: string
	title: string
	instanceComponent?: SvelteComponent
	settingsComponent?: SvelteComponent
	previewComponent?: SvelteComponent
	liveComponent?: SvelteComponent
	defaults: ModuleDefaultsInterface
	locales: Record<string, any>
}
```

The additional interfaces expected are:

```typescript
export interface ModuleDefaultsInterface {
	title: string
	box: BoxInterface
	settings: any
	live: any
}

export interface BoxInterface {
    x: number
    y: number
    width: number
    height: number
    rotate?: number
}
```

* **uuid** -- a randomly generated UUIDv4. This will likely be changed to use namespaced UUIDs as development progresses further.
* **title** -- the name that appears in the modules list.
* **instanceComponent** -- a compiled Svelte component that invisibly exists when a module is active.
	* This is used for any constant functionality, such as microphone input, file serving, and more.
* **settingsComponent** -- a compiled Svelte component that exists when the module's settings panel is open.
	* This is used to configure the module.
* **previewComponent** -- a compiled Svelte component that exists in the overlay preview area.
	* This is used to show the user a preview of what the module should look like. Additionally, it can be used to provide more intuitive direct control.
* **liveComponent** -- a compiled Svelte component that exists in the external web view.
	* This is used in OBS browser sources (and otherwise) to actually show the end result of the module.
* **defaults** -- the default configuration that instances of the module are set to.
* **locales** -- a map of locale definitions to provide multi-language support.
	* These use top-level i18n locale names that map to an arbitrarily deep map of key to string values.

The various Svelte components receive the following:

* settings
	* **bind:settings** => any
	* **bind:live** => ???
	* **bind:box** => BoxInterface
		* The interface to the box.
	* **bind:updateBox** => (value: BoxInterface) => void
		* Called to update the module's box.
	* **channel** => ModuleChannel
		* Used for intercommunication with this module's channels or cross-communication with other modules and services.
	* **assets** => AssetManager
		* Used for accessing Litch's asset collection system.
	* **format** => Format
		* Used for localizing text.

* preview
	* **settings** => any
	* **bind:box** => BoxInterface
		* The interface to the box.
	* **live** => ???
	* **zoom** => number
	* **update** => (settings: any) => void
		* Updates the settings and triggers the overlay to refresh.
	* **channel** => ModuleChannel
		* Used for intercommunication with this module's channels or cross-communication with other modules and services.
	* **assets** => AssetManager
		* Used for accessing Litch's asset collection system.
	* **format** => Format
		* Used for localizing text.

* instance
	* **settings** => any
	* **bind:live** => ???
	* **update** => (settings: any) => void
		* Updates the settings and triggers the overlay to refresh.
	* **channel** => ModuleChannel
		* Used for intercommunication with this module's channels or cross-communication with other modules and services.
	* **assets** => AssetManager
		* Used for accessing Litch's asset collection system.
	* **format** => Format
	
* live
	* **bind:settings** => any
	* **bind:box** => BoxInterface
	* **bind:live** => ???
	* **channel** => ModuleChannel
		* Used for intercommunication with this module's channels or cross-communication with other modules and services.
	* **assets** => AssetManager
		* Used for accessing Litch's asset collection system.

A basic example can be found in `modules/dummy` or any of the other built-in modules can be referenced for additional functionality.

## How are Modules Loaded?
On program initialization, the `modules` directory is scanned and all contained folders will be loaded as modules. The load step attempts to `import` a `dist/index.js` in each module directory.

* **Events**
	* `modules.<name>.load` on successful load.
	* `modules.<name>.fail` on failure.

## Module Channels
Communication between channels should be handled with the `channel: ModuleChannel` object. These are unique channel objects per component that provide a connection to Litch's publisher/subscriber system.

The interface is:

```typescript
export interface ModuleChannel {
	receive: (msg: any) => Promise<void>
	publish: (topic: string, msg: any) => Promise<void>
	subscribe: (topic: string) => () => void
	unsubscribe: (topic?: string) => void
}
```

* **receive** -- An overridable function that can be used by the component to handle the receiving of messages.
* **publish** -- A function that is called to publish messages to this module's other components.
* **subscribe** -- Subscribes to a specific topic. Returns an unsubscriber.
* **unsubscribe** -- Unsubscribes to a given topic or all topics if missing.

In general all communication can be done in a similar manner as follows:

```
channel.receive = ({topic: string, msg: any}) => {
	if (topic === "...") {
		channel.publish("okay", ...)
	}
}
```