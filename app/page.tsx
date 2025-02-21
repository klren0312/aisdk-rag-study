'use client'

import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.parts ? (
              <div className="space-y-2">
                {m.parts.map((part, index) => {
                  switch(part.type) {
                    case 'tool-invocation':
                      return (
                        <div key={index} className="bg-gray-100 dark:bg-zinc-800 p-3 rounded">
                          <div className="text-sm text-gray-500">工具调用：{part.toolInvocation.toolName}</div>
                          <div className="mt-1">{part.toolInvocation.state === 'result' && JSON.stringify(part.toolInvocation.result)}</div>
                        </div>
                      )
                    case 'text':
                      return <p key={index}>{part.text}</p>
                    case 'reasoning':
                      return (
                        <div key={index} className="border-l-4 border-blue-500 pl-3 py-1 my-2 text-gray-600 dark:text-gray-400 text-sm italic">
                          {part.reasoning}
                        </div>
                      )
                    default:
                      return ''
                  }
                })}
              </div>
            ) : (
              <p>{m.content}</p>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
