import { apiFetch, apiPost } from "~/lib/api"

export type Chat = {
  owner: string
  name: string
  displayName: string
  createdTime: string
  organization?: string
  store: string
  user: string
  modelProvider?: string
  needTitle: boolean
  messageCount?: number
  category?: string
  isHidden?: boolean
}

export function getChats(
  user: string,
  storeName = "",
  page: number | string = "",
  pageSize: number | string = "",
  field = "",
  value = "",
  sortField = "",
  sortOrder = "",
  selectedUser = "",
  startTime = "",
  endTime = ""
): Promise<any> {
  return apiFetch(
    `/api/get-chats?user=${user}&selectedUser=${selectedUser}&store=${storeName}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}&startTime=${startTime}&endTime=${endTime}`
  )
}

export function getChat(owner: string, name: string): Promise<any> {
  return apiFetch(`/api/get-chat?id=${owner}/${encodeURIComponent(name)}`)
}

export function addChat(chat: Partial<Chat>): Promise<any> {
  return apiPost("/api/add-chat", chat)
}

export function updateChat(owner: string, name: string, chat: Partial<Chat>): Promise<any> {
  return apiPost(`/api/update-chat?id=${owner}/${encodeURIComponent(name)}`, chat)
}

export function deleteChat(chat: Partial<Chat>): Promise<any> {
  return apiPost("/api/delete-chat", chat)
}
