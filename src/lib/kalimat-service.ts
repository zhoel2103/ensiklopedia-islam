export type KalimatSearchResult = {
  id: string
  text: string
  translatedText: string
  type: string
}

export async function searchKalimatApi(query: string): Promise<KalimatSearchResult[]> {
  const apiKey = process.env.KALIMAT_API_KEY
  if (!apiKey) {
    console.warn("KALIMAT_API_KEY is not set in environment variables.")
    return []
  }

  try {
    const url = `https://api.kalimat.dev/api/v2/search?query=${encodeURIComponent(query)}&getText=true`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Accept": "application/json"
      },
      // Optional timeout
      signal: AbortSignal.timeout(10000)
    })

    if (!res.ok) {
      console.error(`Kalimat API responded with status: ${res.status}`)
      return []
    }

    const data = await res.json()
    if (data?.data?.results && Array.isArray(data.data.results)) {
      return data.data.results as KalimatSearchResult[]
    }
    
    return []
  } catch (error) {
    console.error("Error calling Kalimat API:", error)
    return []
  }
}
