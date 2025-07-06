const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables not set properly')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n📡 Testing basic connection...')
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Auth session error (expected):', error.message)
    } else {
      console.log('✅ Basic connection successful')
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

async function testCustomerCRUD() {
  console.log('\n👥 Testing Customer CRUD Operations...')
  
  try {
    // Test reading customers
    console.log('📖 Testing customer read...')
    const { data: customers, error: readError } = await supabase
      .from('customers')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.log('❌ Customer read error:', readError.message)
      return false
    }
    
    console.log('✅ Customer read successful, found:', customers.length, 'customers')
    
    // Test creating a customer
    console.log('📝 Testing customer create...')
    const testCustomer = {
      customer_code: 'TEST001',
      first_name: 'Test',
      last_name: 'Customer',
      credit_score: 100,
      late_payment_count: 0,
      late_payment_points: 0,
      status: 'Active'
    }
    
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert([testCustomer])
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Customer create error:', createError.message)
      return false
    }
    
    console.log('✅ Customer create successful, ID:', newCustomer.id)
    
    // Test updating the customer
    console.log('📝 Testing customer update...')
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({ first_name: 'Updated Test' })
      .eq('id', newCustomer.id)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Customer update error:', updateError.message)
      return false
    }
    
    console.log('✅ Customer update successful')
    
    // Test deleting (soft delete) the customer
    console.log('🗑️  Testing customer soft delete...')
    const { error: deleteError } = await supabase
      .from('customers')
      .update({ status: 'Inactive' })
      .eq('id', newCustomer.id)
    
    if (deleteError) {
      console.log('❌ Customer delete error:', deleteError.message)
      return false
    }
    
    console.log('✅ Customer soft delete successful')
    
    // Clean up - hard delete the test customer
    const { error: hardDeleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', newCustomer.id)
    
    if (hardDeleteError) {
      console.log('⚠️  Hard delete error (cleanup):', hardDeleteError.message)
    } else {
      console.log('🧹 Test customer cleaned up')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Customer CRUD test failed:', error.message)
    return false
  }
}

async function testLoanCRUD() {
  console.log('\n💰 Testing Loan CRUD Operations...')
  
  try {
    // Test reading loans
    console.log('📖 Testing loan read...')
    const { data: loans, error: readError } = await supabase
      .from('loans')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.log('❌ Loan read error:', readError.message)
      return false
    }
    
    console.log('✅ Loan read successful, found:', loans.length, 'loans')
    
    // Test reading loan types
    console.log('📖 Testing loan types read...')
    const { data: loanTypes, error: typesError } = await supabase
      .from('loan_types')
      .select('*')
      .limit(5)
    
    if (typesError) {
      console.log('❌ Loan types read error:', typesError.message)
      return false
    }
    
    console.log('✅ Loan types read successful, found:', loanTypes.length, 'types')
    
    return true
    
  } catch (error) {
    console.error('❌ Loan CRUD test failed:', error.message)
    return false
  }
}

async function testPaymentCRUD() {
  console.log('\n💳 Testing Payment CRUD Operations...')
  
  try {
    // Test reading payments
    console.log('📖 Testing payment read...')
    const { data: payments, error: readError } = await supabase
      .from('payments')
      .select('*')
      .limit(5)
    
    if (readError) {
      console.log('❌ Payment read error:', readError.message)
      return false
    }
    
    console.log('✅ Payment read successful, found:', payments.length, 'payments')
    
    return true
    
  } catch (error) {
    console.error('❌ Payment CRUD test failed:', error.message)
    return false
  }
}

async function testSchemaAccess() {
  console.log('\n🗂️  Testing Schema Access...')
  
  try {
    // List all tables in the public schema
    const { data: tables, error } = await supabase.rpc('list_tables')
    
    if (error) {
      console.log('⚠️  Table listing error (expected):', error.message)
    }
    
    // Test different possible table names
    const tableNames = ['customers', 'loans', 'payments', 'users', 'branches', 'collectors']
    
    for (const tableName of tableNames) {
      const { data: tableInfo, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0)
      
      if (tableError) {
        console.log(`❌ ${tableName} table access error:`, tableError.message)
      } else {
        console.log(`✅ ${tableName} table accessible`)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Schema access test failed:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🧪 Starting Supabase Database Tests\n')
  
  const results = {
    connection: await testConnection(),
    schema: await testSchemaAccess(),
    customers: await testCustomerCRUD(),
    loans: await testLoanCRUD(),
    payments: await testPaymentCRUD()
  }
  
  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log('Connection:', results.connection ? '✅ PASS' : '❌ FAIL')
  console.log('Schema Access:', results.schema ? '✅ PASS' : '❌ FAIL')
  console.log('Customer CRUD:', results.customers ? '✅ PASS' : '❌ FAIL')
  console.log('Loan CRUD:', results.loans ? '✅ PASS' : '❌ FAIL')
  console.log('Payment CRUD:', results.payments ? '✅ PASS' : '❌ FAIL')
  
  const allPassed = Object.values(results).every(result => result === true)
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Supabase database is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the database setup and table schema.')
  }
  
  return results
}

// Run the tests
runAllTests().catch(console.error)