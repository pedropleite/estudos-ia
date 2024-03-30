import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI();

const functions: any = {
	add: (obj: { a: number; b: number }) => {
		console.log("A soma é ", obj.a + obj.b)
	},
	subtract: (obj: { a: number; b: number }) => {
		console.log("A subtração é ", obj.a - obj.b)
	}
}

const response = await openai.chat.completions.create({
	model: "gpt-3.5-turbo",
	temperature: 0,
	messages: [
		{
			role: "system",
			content: `
				Você é uma calculadora
      		`
		},
		{
			role: "user",
			content: "Quanto é 2 + 2?"
		}
	],
	functions: [
		{
			name: "add",
			description: "Add two numbers",
			parameters: {
				type: "object",
				properties: {
					a: {
						type: "number"
					},
					b: {
						type: "number"
					}
				}
			},
		},
		{
			name: "subtract",
			description: "Subtract two numbers",
			parameters: {
				type: "object",
				properties: {
					a: {
						type: "number"
					},
					b: {
						type: "number"
					}
				}
			},
		},
	]
})

console.log(response.choices[0].message)

const function_call = response.choices[0].message.function_call

if (function_call) {
	const name = function_call.name
	const args = JSON.parse(function_call.arguments)

	const fn = functions[name]

	fn(args)
}