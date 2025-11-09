# 🛠️ Development Patterns Guide

## Web3News - Blockchain Content Aggregator

**Created:** 2025-11-07  
**Agents:** Develop Agent, Progress Agent, Project Manager  
**Status:** ✅ Complete  
**Purpose:** Extract actionable patterns from learn-anything (data collection) and Tilly (messaging) for Web3News development

---

## 📊 EXECUTIVE SUMMARY

### Key Patterns to Adopt

1. **learn-anything Data Collection Patterns:**
   - Knowledge graph approach for relationships
   - Multi-source aggregation with link extraction
   - URL normalization and deduplication
   - Content enrichment from multiple sources

2. **Tilly Messaging Patterns:**
   - Offline-first message queue
   - Optimistic UI updates
   - Client-side encryption (for sensitive data)
   - Real-time sync with conflict resolution
   - Message status indicators (sent, delivered, read)

---

## 🔍 PART 1: learn-anything Data Collection Patterns

### Pattern 1: Knowledge Graph Approach

**Concept:** Build relationships between articles, topics, and resources

**Implementation for Web3News:**

```typescript
// src/lib/services/knowledgeGraph.ts
interface KnowledgeNode {
  id: string;
  type: "article" | "topic" | "source" | "user";
  data: any;
  relationships: Relationship[];
}

interface Relationship {
  from: string;
  to: string;
  type:
    | "related-to"
    | "similar-to"
    | "mentions"
    | "authored-by"
    | "tagged-with";
  strength: number; // 0-1
}

class KnowledgeGraph {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private relationships: Relationship[] = [];

  /**
   * Extract relationships from article content
   */
  async extractRelationships(article: Article): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    // 1. Extract topics/tags
    const topics = await this.extractTopics(article);
    for (const topic of topics) {
      relationships.push({
        from: article.id,
        to: topic.id,
        type: "tagged-with",
        strength: 0.8,
      });
    }

    // 2. Extract mentioned articles (from links)
    const links = await this.extractLinks(article);
    for (const link of links) {
      const linkedArticle = await this.findArticleByUrl(link);
      if (linkedArticle) {
        relationships.push({
          from: article.id,
          to: linkedArticle.id,
          type: "mentions",
          strength: 0.6,
        });
      }
    }

    // 3. Find similar articles (by topic overlap)
    const similar = await this.findSimilarArticles(article, topics);
    for (const similarArticle of similar) {
      relationships.push({
        from: article.id,
        to: similarArticle.id,
        type: "similar-to",
        strength: this.calculateSimilarity(article, similarArticle),
      });
    }

    return relationships;
  }

  /**
   * Extract topics from article content
   */
  private async extractTopics(article: Article): Promise<Topic[]> {
    // Use keywords, tags, categories
    const text = `${article.title} ${article.excerpt} ${article.content || ""}`;

    // Simple keyword extraction (can be enhanced with NLP)
    const keywords = this.extractKeywords(text);

    // Map to existing topics or create new ones
    return keywords.map((keyword) => ({
      id: `topic-${keyword.toLowerCase()}`,
      name: keyword,
      category: article.category,
    }));
  }

  /**
   * Find similar articles based on topic overlap
   */
  private async findSimilarArticles(
    article: Article,
    topics: Topic[]
  ): Promise<Article[]> {
    // Query Supabase for articles with similar topics
    const { data } = await supabase
      .from("articles")
      .select("*")
      .in("category", [article.category])
      .neq("id", article.id)
      .limit(10);

    // Calculate similarity scores
    return data
      .map((other) => ({
        article: other,
        similarity: this.calculateTopicOverlap(topics, other.topics || []),
      }))
      .filter((item) => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .map((item) => item.article);
  }
}
```

### Pattern 2: Enhanced Link Extraction

**Concept:** Extract and normalize links from content to discover new resources

**Implementation:**

```typescript
// src/lib/services/linkExtractor.ts
class LinkExtractor {
  /**
   * Extract all links from content (markdown, HTML, plain text)
   */
  extractLinks(content: string): string[] {
    const links: string[] = [];

    // 1. Extract markdown links: [text](url)
    const markdownLinks = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    markdownLinks.forEach((match) => {
      const url = match.match(/\(([^)]+)\)/)?.[1];
      if (url) links.push(url);
    });

    // 2. Extract plain URLs: https://example.com
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    const plainUrls = content.match(urlRegex) || [];
    links.push(...plainUrls);

    // 3. Extract HTML links: <a href="url">
    const htmlLinks = content.match(/href=["']([^"']+)["']/g) || [];
    htmlLinks.forEach((match) => {
      const url = match.match(/["']([^"']+)["']/)?.[1];
      if (url && url.startsWith("http")) links.push(url);
    });

    // 4. Normalize and deduplicate
    return this.normalizeAndDeduplicate(links);
  }

  /**
   * Normalize URLs (remove tracking params, normalize protocol, etc.)
   */
  normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);

      // Remove tracking parameters
      const trackingParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "ref",
        "fbclid",
        "gclid",
        "source",
      ];
      trackingParams.forEach((param) => parsed.searchParams.delete(param));

      // Normalize protocol (always HTTPS)
      parsed.protocol = "https:";

      // Normalize www subdomain
      if (parsed.hostname.startsWith("www.")) {
        parsed.hostname = parsed.hostname.substring(4);
      }

      // Remove trailing slash (except root)
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }

      // Remove fragment (hash)
      parsed.hash = "";

      return parsed.toString();
    } catch {
      return url;
    }
  }

  /**
   * Normalize and deduplicate links
   */
  normalizeAndDeduplicate(links: string[]): string[] {
    const normalized = links.map((link) => this.normalizeUrl(link));
    return Array.from(new Set(normalized));
  }

  /**
   * Extract links from GitHub README
   */
  async extractFromGitHubRepo(repoUrl: string): Promise<string[]> {
    // Fetch README.md content
    const readmeUrl =
      repoUrl.replace("/github.com/", "/raw.githubusercontent.com/") +
      "/main/README.md";

    try {
      const response = await fetch(readmeUrl);
      const content = await response.text();
      return this.extractLinks(content);
    } catch {
      return [];
    }
  }

  /**
   * Extract links from Reddit post
   */
  async extractFromRedditPost(postId: string): Promise<string[]> {
    // Reddit API returns post content
    const response = await fetch(
      `https://www.reddit.com/r/all/comments/${postId}.json`
    );
    const data = await response.json();

    const links: string[] = [];
    if (data[0]?.data?.children) {
      data[0].data.children.forEach((child: any) => {
        const post = child.data;
        if (post.selftext) {
          links.push(...this.extractLinks(post.selftext));
        }
        if (post.url && post.url.startsWith("http")) {
          links.push(post.url);
        }
      });
    }

    return this.normalizeAndDeduplicate(links);
  }
}
```

### Pattern 3: Multi-Source Enrichment

**Concept:** Enrich articles with data from multiple sources (Wikidata, GitHub, etc.)

**Implementation:**

```typescript
// src/lib/services/articleEnricher.ts
class ArticleEnricher {
  private linkExtractor: LinkExtractor;
  private knowledgeGraph: KnowledgeGraph;

  /**
   * Enrich article with links, topics, and relationships
   */
  async enrichArticle(article: Article): Promise<EnrichedArticle> {
    const [links, topics, relationships] = await Promise.all([
      this.extractLinksFromArticle(article),
      this.extractTopicsFromArticle(article),
      this.findRelatedArticles(article),
    ]);

    return {
      ...article,
      links,
      topics,
      relatedArticles: relationships,
      enrichedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract links from article content
   */
  private async extractLinksFromArticle(article: Article): Promise<string[]> {
    const links: string[] = [];

    // Extract from description/excerpt
    if (article.excerpt) {
      links.push(...this.linkExtractor.extractLinks(article.excerpt));
    }

    // Extract from source-specific content
    if (article.source === "GitHub" && article.url) {
      links.push(
        ...(await this.linkExtractor.extractFromGitHubRepo(article.url))
      );
    }

    if (article.source === "Reddit" && article.id) {
      links.push(
        ...(await this.linkExtractor.extractFromRedditPost(article.id))
      );
    }

    return this.linkExtractor.normalizeAndDeduplicate(links);
  }

  /**
   * Extract topics using multiple methods
   */
  private async extractTopicsFromArticle(article: Article): Promise<Topic[]> {
    const topics: Topic[] = [];

    // 1. From article category
    topics.push({
      id: `category-${article.category}`,
      name: article.category,
      type: "category",
    });

    // 2. From article tags (if available)
    if (article.tags) {
      article.tags.forEach((tag) => {
        topics.push({
          id: `tag-${tag.toLowerCase()}`,
          name: tag,
          type: "tag",
        });
      });
    }

    // 3. From content keywords (simple extraction)
    const keywords = this.extractKeywords(
      `${article.title} ${article.excerpt}`
    );
    keywords.forEach((keyword) => {
      topics.push({
        id: `keyword-${keyword.toLowerCase()}`,
        name: keyword,
        type: "keyword",
      });
    });

    return topics;
  }

  /**
   * Find related articles using knowledge graph
   */
  private async findRelatedArticles(article: Article): Promise<Article[]> {
    return this.knowledgeGraph.findSimilarArticles(article, []);
  }
}
```

### Pattern 4: Enhanced Content Aggregator Integration

**Update existing ContentAggregator:**

```typescript
// src/lib/services/contentAggregator.ts (enhancements)
class ContentAggregator {
  private linkExtractor: LinkExtractor;
  private articleEnricher: ArticleEnricher;
  private knowledgeGraph: KnowledgeGraph;

  /**
   * Enhanced aggregation with link extraction and enrichment
   */
  async aggregateSources(category?: string): Promise<Article[]> {
    // 1. Fetch from sources (existing logic)
    const articles = await this.fetchFromSources(category);

    // 2. Extract links from each article
    const enrichedArticles = await Promise.all(
      articles.map((article) => this.articleEnricher.enrichArticle(article))
    );

    // 3. Build knowledge graph relationships
    for (const article of enrichedArticles) {
      const relationships =
        await this.knowledgeGraph.extractRelationships(article);
      await this.knowledgeGraph.addRelationships(relationships);
    }

    // 4. Store enriched articles
    await this.cache.setArticles(enrichedArticles, category);

    return enrichedArticles;
  }

  /**
   * Extract links from GitHub repository README
   */
  async fetchGitHubTrending(page = 1): Promise<Article[]> {
    // ... existing GitHub API logic ...

    // After fetching repos, extract links from READMEs
    const enrichedRepos = await Promise.all(
      repos.map(async (repo) => {
        const links = await this.linkExtractor.extractFromGitHubRepo(
          repo.html_url
        );
        return {
          ...repo,
          links,
        };
      })
    );

    return enrichedRepos;
  }
}
```

---

## 💬 PART 2: Tilly Messaging Patterns

### Pattern 1: Offline-First Message Queue

**Concept:** Queue messages locally when offline, sync when online

**Implementation:**

```typescript
// src/lib/services/messageQueue.ts
interface QueuedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: "pending" | "sending" | "sent" | "failed";
  createdAt: number;
  retries: number;
}

class MessageQueue {
  private queue: LocalForage<QueuedMessage[]>;
  private maxRetries = 3;

  constructor() {
    this.queue = localforage.createInstance({
      name: "web3news",
      storeName: "messageQueue",
    });
  }

  /**
   * Add message to queue (offline or online)
   */
  async queueMessage(
    message: Omit<QueuedMessage, "id" | "status" | "createdAt" | "retries">
  ): Promise<string> {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      status: "pending",
      createdAt: Date.now(),
      retries: 0,
    };

    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    queue.push(queuedMessage);
    await this.queue.setItem("queue", queue);

    // Try to send immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return queuedMessage.id;
  }

  /**
   * Process queued messages (called when online)
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;

    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    const pending = queue.filter(
      (msg) => msg.status === "pending" || msg.status === "failed"
    );

    for (const message of pending) {
      try {
        message.status = "sending";
        await this.updateQueue(queue);

        // Send to Supabase
        await supabase.from("messages").insert({
          conversation_id: message.conversationId,
          sender_id: message.senderId,
          content: message.content,
        });

        message.status = "sent";
        await this.updateQueue(queue);

        // Remove from queue after successful send
        const updatedQueue = queue.filter((msg) => msg.id !== message.id);
        await this.queue.setItem("queue", updatedQueue);
      } catch (error) {
        message.retries++;
        if (message.retries >= this.maxRetries) {
          message.status = "failed";
        } else {
          message.status = "pending";
        }
        await this.updateQueue(queue);
      }
    }
  }

  private async updateQueue(queue: QueuedMessage[]): Promise<void> {
    await this.queue.setItem("queue", queue);
  }

  /**
   * Get queued messages for a conversation
   */
  async getQueuedMessages(conversationId: string): Promise<QueuedMessage[]> {
    const queue = (await this.queue.getItem<QueuedMessage[]>("queue")) || [];
    return queue.filter(
      (msg) =>
        msg.conversationId === conversationId &&
        (msg.status === "pending" || msg.status === "sending")
    );
  }
}
```

### Pattern 2: Optimistic UI Updates

**Concept:** Show messages immediately in UI, sync in background

**Implementation:**

```typescript
// src/lib/hooks/useMessages.ts
export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const messageQueue = useMessageQueue();

  // Load messages from Supabase
  const { data: supabaseMessages } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
  });

  // Load queued messages (pending sends)
  useEffect(() => {
    messageQueue.getQueuedMessages(conversationId).then(setQueuedMessages);
  }, [conversationId]);

  // Merge Supabase messages with queued messages
  useEffect(() => {
    const allMessages = [
      ...(supabaseMessages || []),
      ...queuedMessages.map((qm) => ({
        id: qm.id,
        conversation_id: qm.conversationId,
        sender_id: qm.senderId,
        content: qm.content,
        is_read: false,
        created_at: new Date(qm.createdAt).toISOString(),
        status: qm.status, // 'pending' | 'sending' | 'sent'
      })),
    ].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    setMessages(allMessages);
  }, [supabaseMessages, queuedMessages]);

  /**
   * Send message with optimistic update
   */
  const sendMessage = async (content: string) => {
    const senderId = useAppStore.getState().userId;
    if (!senderId) return;

    // 1. Optimistic update - add to UI immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      status: "pending",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // 2. Queue message (handles offline/online)
    await messageQueue.queueMessage({
      conversationId,
      senderId,
      content,
    });

    // 3. Process queue (will sync when online)
    await messageQueue.processQueue();
  };

  return {
    messages,
    sendMessage,
    isLoading: false,
  };
}
```

### Pattern 3: Message Status Indicators

**Concept:** Show message delivery status (pending, sending, sent, delivered, read)

**Implementation:**

```typescript
// src/components/messages/MessageBubble.tsx
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const getStatusIcon = () => {
    if (message.status === 'pending') {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }
    if (message.status === 'sending') {
      return <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />;
    }
    if (message.status === 'sent') {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
    if (message.is_read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p>{message.content}</p>
        <div className="flex items-center justify-end mt-1 gap-1">
          <span className="text-xs opacity-70">
            {formatTime(message.created_at)}
          </span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 4: Real-time Sync with Supabase

**Concept:** Use Supabase Realtime for instant message delivery

**Implementation:**

```typescript
// src/lib/hooks/useRealtimeMessages.ts
export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    // 1. Load initial messages
    getMessages(conversationId).then(setMessages);

    // 2. Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  return messages;
}
```

### Pattern 5: Conflict Resolution for Offline Edits

**Concept:** Handle conflicts when multiple devices edit the same conversation

**Implementation:**

```typescript
// src/lib/services/messageSync.ts
class MessageSync {
  /**
   * Resolve conflicts between local and server messages
   */
  async resolveConflicts(
    localMessages: Message[],
    serverMessages: Message[]
  ): Promise<Message[]> {
    const merged: Message[] = [];
    const localMap = new Map(localMessages.map((m) => [m.id, m]));
    const serverMap = new Map(serverMessages.map((m) => [m.id, m]));

    // 1. Add all server messages (source of truth)
    serverMessages.forEach((msg) => merged.push(msg));

    // 2. Add local messages that don't exist on server (pending sends)
    localMessages.forEach((localMsg) => {
      if (!serverMap.has(localMsg.id) && localMsg.status === "pending") {
        merged.push(localMsg);
      }
    });

    // 3. Sort by timestamp
    merged.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return merged;
  }
}
```

---

## 📝 IMPLEMENTATION CHECKLIST FOR DEVELOP AGENT

### Data Collection Enhancements

- [ ] **Implement LinkExtractor class**
  - Extract links from markdown, HTML, plain text
  - Normalize URLs (remove tracking params, normalize protocol)
  - Deduplicate links

- [ ] **Implement KnowledgeGraph class**
  - Extract relationships between articles
  - Find similar articles
  - Build topic clusters

- [ ] **Implement ArticleEnricher class**
  - Enrich articles with links
  - Extract topics from content
  - Find related articles

- [ ] **Enhance ContentAggregator**
  - Integrate link extraction
  - Integrate article enrichment
  - Build knowledge graph relationships

- [ ] **Add pagination support**
  - GitHub API pagination
  - Reddit API pagination
  - RSS feed pagination

- [ ] **Enhance rate limiter**
  - Exponential backoff on rate limit errors
  - Token rotation for higher limits

### Messaging Enhancements

- [ ] **Implement MessageQueue class**
  - Queue messages when offline
  - Process queue when online
  - Retry failed messages

- [ ] **Implement optimistic UI updates**
  - Show messages immediately
  - Sync in background
  - Handle failures gracefully

- [ ] **Add message status indicators**
  - Pending, sending, sent, delivered, read
  - Visual indicators in UI

- [ ] **Implement real-time sync**
  - Supabase Realtime subscriptions
  - Handle connection drops
  - Reconnect logic

- [ ] **Add conflict resolution**
  - Merge local and server messages
  - Handle offline edits
  - Preserve message order

---

## 🎯 PRIORITY ORDER

### Phase 1: Data Collection (High Priority)

1. LinkExtractor implementation
2. Enhanced ContentAggregator with link extraction
3. Pagination support for APIs
4. Enhanced rate limiter

### Phase 2: Messaging (Medium Priority)

1. MessageQueue implementation
2. Optimistic UI updates
3. Real-time sync with Supabase
4. Message status indicators

### Phase 3: Knowledge Graph (Low Priority - Future)

1. KnowledgeGraph implementation
2. ArticleEnricher with relationships
3. Topic clustering
4. Related articles recommendations

---

## 📚 REFERENCES

- [learn-anything/past-snapshot-before-rewrite](https://github.com/learn-anything/past-snapshot-before-rewrite)
- [ccssmnn/tilly](https://github.com/ccssmnn/tilly)
- [Tilly Live Demo](https://tilly.social)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)

---

**Status:** ✅ Development Patterns Guide Complete  
**Next:** Implement patterns in development phase
