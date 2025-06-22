from ninja import Router

from . import create, list

router = Router()


router.add_router("/list", list.router, tags=["messages"])
router.add_router("/create", create.router, tags=["messages"])
