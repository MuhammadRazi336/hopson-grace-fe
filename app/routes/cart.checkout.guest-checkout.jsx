import {json} from '@shopify/remix-oxygen';

// Action for step 2: Guest checkout
export async function action({request, context}) {
  try {
    const formData = await request.formData();
    const paymentIntentId = formData.get('paymentIntentId')?.trim();
    
    if (!paymentIntentId) {
      return json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }
    
    // Get data from session
    const lineItems = JSON.parse(context.session.get('lineItems') || '[]');
    const message = context.session.get('message') || '';
    const firstName = context.session.get('firstName') || '';
    const lastName = context.session.get('lastName') || '';
    const email = context.session.get('email') || '';
    const registryId = context.session.get('registryId') || '';
    
    if (!lineItems.length || !firstName || !lastName || !email || !registryId) {
      return json(
        { error: 'Missing required checkout data' },
        { status: 400 }
      );
    }
    
    // Step 2: Guest checkout
    const guestCheckoutPayload = {
      registryId: Number(registryId),
      email: email,
      firstName: firstName,
      lastName: lastName,
      lineItems: lineItems,
      message: message,
      paymentIntentId: paymentIntentId
    };
    
    const guestCheckoutResponse = await context.ClientPost(
      guestCheckoutPayload,
      'transactions/guest-checkout',
      context,
    );
    
    if (guestCheckoutResponse?.data?.checkoutNumber) {
      // Clear session data after successful checkout
      context.session.set('paymentIntentId', '');
      context.session.set('lineItems', '');
      context.session.set('message', '');
      context.session.set('firstName', '');
      context.session.set('lastName', '');
      context.session.set('email', '');
      context.session.set('registryId', '');
      context.session.set('couplesName', '');
      
      return json(
        {
          success: true,
          checkoutNumber: guestCheckoutResponse.data.checkoutNumber,
          paymentIntentId: guestCheckoutResponse.data.paymentIntentId,
          greetingDetails: guestCheckoutResponse.data.greetingDetails
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': await context.session.commit()
          }
        }
      );
    } else {
      return json(
        {error: 'Guest checkout failed'},
        {status: 400}
      );
    }
  } catch (error) {
    return json(
      {error: error.message || 'An error occurred during guest checkout'},
      {status: 500}
    );
  }
}
