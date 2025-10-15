import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { HandlerResult } from '@/backend/http/response';
import { success, failure } from '@/backend/http/response';
import type { PolicyDocumentPayload } from './schema';
import { policyDocumentErrorCodes, policyDocumentErrorMessages } from './error';

type PolicyDocumentRow = Database['public']['Tables']['policy_documents']['Row'];

export async function getPolicyDocumentBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<HandlerResult<PolicyDocumentPayload, string>> {
  try {
    const { data, error } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return failure(
        500,
        policyDocumentErrorCodes.UNKNOWN,
        policyDocumentErrorMessages[policyDocumentErrorCodes.UNKNOWN],
        { supabaseError: error.message }
      );
    }

    if (!data) {
      return failure(
        404,
        policyDocumentErrorCodes.NOT_FOUND,
        policyDocumentErrorMessages[policyDocumentErrorCodes.NOT_FOUND],
        { slug }
      );
    }

    const payload: PolicyDocumentPayload = mapRowToPayload(data);

    return success(payload);
  } catch (err) {
    return failure(
      500,
      policyDocumentErrorCodes.UNKNOWN,
      policyDocumentErrorMessages[policyDocumentErrorCodes.UNKNOWN],
      { error: err instanceof Error ? err.message : String(err) }
    );
  }
}

function mapRowToPayload(row: PolicyDocumentRow): PolicyDocumentPayload {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    contentMarkdown: row.content_markdown,
    version: row.version,
    effectiveFrom: row.effective_from,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

