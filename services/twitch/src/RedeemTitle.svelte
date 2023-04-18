<script lang="ts">
	import type { Format } from '@kettek/litch-app/src/interfaces/Format'
  import type { ServiceData } from "./interfaces"

	interface ConditionI {
		id: string
	}

	export let format: Format
	export let data: ServiceData
	export let condition: ConditionI
</script>

<span>
	{format('redeem')}: {data.redeems.find(v=>v.id===condition.id)?.title??'-'}
</span>