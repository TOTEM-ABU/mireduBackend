const { PrismaClient } = require('./src/generated/prisma/client');
const client = new PrismaClient();

async function addTest() {
  try {
    const student = await client.sTUDENT.findFirst();
    const group = await client.gROUP.findFirst();

    if (!student || !group) {
      console.log('No student or group found');
      return;
    }

    console.log(`Adding student ${student.id} to group ${group.id}`);

    const updated = await client.gROUP.update({
      where: { id: group.id },
      data: {
        students: { connect: { id: student.id } },
      },
      include: { students: true },
    });

    console.log('Success:', updated.students.length);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.$disconnect();
  }
}

addTest();
