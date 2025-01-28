import Accordiance from './Accordiance';

const REGISTRY_CHECKLIST = [
  {
    id: 'guests',
    title: 'How many Guests are invited?',
    isCompleted: (registry) => registry?.events?.noOfGuest,
    content: (registry) => registry?.events?.noOfGuest || 'Not Submitted',
    link: '/dashboard/registry',
  },
  {
    id: 'shipping',
    title: 'Where should we ship your gifts?',
    isCompleted: (registry) => registry?.shippingAddress,
    content: (registry) => registry?.shippingAddress?.city || 'Not Submitted',
    link: '/dashboard/profile',
  },
  {
    id: 'gifts',
    title: 'Add gifts to your registry',
    isCompleted: (registry) => registry?.giftAvailable,
    content: (registry) => (registry?.giftAvailable ? 'Yes' : 'No'),
    link: '/dashboard/addgifts',
  },
  {
    id: 'cashFund',
    title: 'Add a cash funds to your registry',
    isCompleted: (registry) => registry?.cashFundSelected,
    content: (registry) => (registry?.cashFundSelected ? 'Yes' : 'No'),
    link: '/dashboard/cashfunds',
  },
];

const RegistryChecklist = ({registry}) => {
  const completedItems = REGISTRY_CHECKLIST.filter((item) =>
    item.isCompleted(registry),
  );
  const todoItems = REGISTRY_CHECKLIST.filter(
    (item) => !item.isCompleted(registry),
  );

  const renderAccordiance = (item) => (
    <div key={item.id} className="my-2">
      <Accordiance
        title={item.title}
        ContentComponent={() => <div>{item.content(registry)}</div>}
        link={item.link}
      />
    </div>
  );

  return (
    <div>
      <h1 className="my-2">Registry Checklist</h1>

      {completedItems.length > 0 && (
        <>
          <h4 className="font-semibold">Completed</h4>
          {completedItems.map(renderAccordiance)}
        </>
      )}

      {todoItems.length > 0 && (
        <div>
          <h4 className="font-semibold">To-Do</h4>
          {todoItems.map(renderAccordiance)}
        </div>
      )}
    </div>
  );
};

export default RegistryChecklist;
