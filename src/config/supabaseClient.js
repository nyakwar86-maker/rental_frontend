
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://taguyeeadqtgfhhrgcmj.supabase.co'
const supabaseKey = 'sb_publishable_qmrEDmkWdalwD4SQJXwRwA_R0cE8teS'

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase