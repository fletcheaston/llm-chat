from ninja import Router

from . import create, list, share, update

router = Router()

router.add_router("/list", list.router, tags=["conversations"])
router.add_router("/create", create.router, tags=["conversations"])
router.add_router("/share", share.router, tags=["conversations"])
router.add_router("/update", update.router, tags=["conversations"])
