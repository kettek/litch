// ugh
const { Publisher: PublisherR } = require('@kettek/pubsub')
import type { Publisher } from "@kettek/pubsub/dist/Publisher"

export let publisher: Publisher = new PublisherR()
